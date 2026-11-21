import importlib.util
import html
import json
import logging
import re
from pathlib import Path
from textwrap import wrap
from collections import Counter


logger = logging.getLogger("casebook.localize")
MODEL_DIRECTORY = Path(__file__).resolve().parent.parent / "data" / "models" / "en-zh"
CHINESE = re.compile(r"[\u3400-\u9fff]")
ENGLISH = re.compile(r"[A-Za-z]")
PREFIX = re.compile(r"^(README 内容摘录：|定价页中的原始片段：|官网中的价格片段（需结合套餐及币种核对）：|内容页可见文本摘录：|发布 )")
NUMBERS = re.compile(r"\d+(?:[.,]\d+)*")
IDENTIFIERS = re.compile(r"`([^`]+)`|\b(?:CVE|GHSA|PSA)-[A-Za-z0-9-]+\b|\b[A-Z][A-Z0-9]*(?:[_-][A-Z0-9]+)+\b")


def needs_translation(text):
    english = len(ENGLISH.findall(text))
    chinese = len(CHINESE.findall(text))
    if chinese and not PREFIX.match(text):
        return False
    return english >= 16 and english > chinese * 3 and len(re.findall(r"[A-Za-z]{2,}", text)) >= 3


def report_texts(report):
    texts = [report["summary"]]
    texts.extend(source["title"] for source in report["sources"])
    texts.extend(fact["text"] for section in report["sections"] for fact in section["facts"])
    for action in report["actions"]:
        texts.extend((action["title"], action["description"]))
    return list(dict.fromkeys(texts))


def valid_translation(original, translated):
    if not CHINESE.search(translated):
        return False
    if Counter(NUMBERS.findall(original)) != Counter(NUMBERS.findall(translated)):
        return False
    for match in IDENTIFIERS.finditer(original):
        identifier = match.group(1) or match.group()
        if identifier not in translated:
            return False
    phrases = re.split(r"[。.;；]\s*", translated)
    if any(count >= 4 for phrase, count in Counter(phrases).items() if len(phrase) > 5):
        return False
    return len(translated) <= max(150, len(original) * 3)


class ChineseTranslator:
    def __init__(self, database):
        self.database = database
        self.translator = None
        self.tokenizer = None
        self.target_prefix = ""
        reviewed_path = Path(__file__).with_name("reviewed_zh.json")
        self.reviewed = json.loads(reviewed_path.read_text(encoding="utf-8")) if reviewed_path.is_file() else {}

    def available(self):
        return (
            (MODEL_DIRECTORY / "model" / "model.bin").is_file()
            and importlib.util.find_spec("ctranslate2") is not None
            and importlib.util.find_spec("sentencepiece") is not None
        )

    def load(self):
        import ctranslate2
        import sentencepiece

        self.translator = ctranslate2.Translator(
            str(MODEL_DIRECTORY / "model"), device="cpu", compute_type="int8", inter_threads=1, intra_threads=4,
        )
        self.tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(MODEL_DIRECTORY / "sentencepiece.model"))
        metadata = json.loads((MODEL_DIRECTORY / "metadata.json").read_text(encoding="utf-8"))
        self.target_prefix = metadata.get("target_prefix", "")

    def translate(self, text):
        if self.translator is None:
            self.load()
        prefix_match = PREFIX.match(text)
        prefix = prefix_match.group() if prefix_match else ""
        content = html.unescape(text[len(prefix):])
        content = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", content)
        content = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", content)
        content = re.sub(r"[#*>`]+", " ", content)
        content = re.sub(r"\s+", " ", content).strip()
        sentences = re.split(r"(?<=[.!?;；])\s+|；", content)
        chunks = [chunk for sentence in sentences for chunk in wrap(sentence, width=220, break_long_words=False, break_on_hyphens=False)] or [content]
        tokens = [self.tokenizer.encode(chunk, out_type=str) for chunk in chunks]
        results = self.translator.translate_batch(
            tokens, target_prefix=[[self.target_prefix]] * len(tokens) if self.target_prefix else None,
            beam_size=2, max_decoding_length=512, replace_unknowns=True,
        )
        translated = "".join(self.tokenizer.decode(result.hypotheses[0]) for result in results).replace("▁", " ").strip()
        if self.target_prefix and translated.startswith(self.target_prefix):
            translated = translated[len(self.target_prefix):].strip()
        translated = prefix + translated
        if not valid_translation(text, translated):
            raise ValueError("译文未通过中文、数字或重复内容检查")
        return translated

    def populate(self, texts):
        candidates = [text for text in dict.fromkeys(texts) if text in self.reviewed or needs_translation(text)]
        cached = self.database.translations_for(candidates)
        count = 0
        for original in candidates:
            if original in self.reviewed and cached.get(original) != self.reviewed[original]:
                self.database.save_translation(original, self.reviewed[original], engine="reviewed")
                cached[original] = self.reviewed[original]
                count += 1
        pending = [text for text in candidates if text not in cached]
        if not pending or not self.available():
            return count
        for text in pending:
            try:
                translated = self.translate(text)
                self.database.save_translation(text, translated)
                count += 1
            except ValueError:
                logger.warning("Translation rejected; retaining original public text")
            except (RuntimeError, OSError):
                logger.exception("Could not translate a public text fragment")
        return count

import json
from pathlib import Path
import unittest

from app_radar.classify import Classifier


class ClassifyRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        config = Path(__file__).resolve().parents[1] / "directions.json"
        cls.classifier = Classifier(json.loads(config.read_text(encoding="utf-8")))

    def classify(self, name):
        return self.classifier.classify({"app_id": "1", "name": name})[0]

    def test_daily_is_not_an_ai_token_in_bible_chat(self):
        for name in ("Bible Chat: Daily Devotional", "Daily Bible Chat"):
            with self.subTest(name=name):
                self.assertEqual(self.classify(name), "圣经与灵修")

    def test_actual_ai_chat_names_remain_recognized(self):
        for name in ("ChatGPT", "AI Chat", "Chat AI Assistant"):
            with self.subTest(name=name):
                self.assertEqual(self.classify(name), "AI 聊天助手")


if __name__ == "__main__":
    unittest.main()

"""Transparent, editable title rules, with store category fallback."""

import re


class Classifier:
    def __init__(self, config):
        self.overrides = config.get("overrides", {})
        self.rules = [(row["label"], re.compile(row["pattern"], re.I))
                      for row in config.get("rules", [])]
        self.genre_labels = config.get("genre_labels", {})
        self.tag_overrides = config.get("tag_overrides", {})
        self.tag_rules = [(row, re.compile(row["pattern"], re.I),
                           re.compile(row["exclude"], re.I) if row.get("exclude") else None)
                          for row in config.get("tag_rules", [])]
        self.taxonomy_version = config.get("taxonomy_version", "unversioned")

    def tags(self, app):
        """Multi-label tags with traceable evidence; broad genres imply no ability."""
        override = self.tag_overrides.get(str(app["app_id"]))
        matches = [(override, "商店说明核对")] if override is not None else [
            (row, "名称规则待复核") for row, pattern, exclude in self.tag_rules
            if pattern.search(app.get("name", "")) and
            not (exclude and exclude.search(app.get("name", "")))]
        result = {"scenes": [], "capabilities": [], "tag_evidence": [],
                  "tag_note": (override or {}).get("note", "")}
        for row, basis in matches:
            for kind in ("scenes", "capabilities"):
                for label in row.get(kind, []):
                    if label not in result[kind]:
                        result[kind].append(label)
                        result["tag_evidence"].append({"kind": kind, "label": label,
                            "basis": basis, "rule_id": row.get("id", str(app["app_id"])),
                            "source_url": row.get("source_url", ""),
                            "reviewed_at": row.get("reviewed_at")})
        result["tag_status"] = ("商店说明核对" if override is not None else
                                "名称规则待复核" if matches else "待补充")
        return result

    def classify(self, app):
        override = self.overrides.get(str(app["app_id"]))
        if override:
            return override, "人工指定"
        for label, pattern in self.rules:
            if pattern.search(app.get("name", "")):
                return label, "名称规则"
        for genre_id in app.get("genre_ids", []):
            if str(genre_id) in self.genre_labels:
                return self.genre_labels[str(genre_id)] + "（商店分类）", "商店分类"
        genres = app.get("genres", [])
        if genres:
            return genres[0] + "（商店分类）", "商店分类"
        return "待分类", "资料不足"

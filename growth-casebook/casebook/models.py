from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Record(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProjectInput(Record):
    url: str = Field(min_length=4, max_length=500)
    name: str = Field(default="", max_length=100)
    github: str = Field(default="", max_length=250)
    category: str = Field(default="软件工具", min_length=1, max_length=50)


class DiscoverySettings(Record):
    enabled: bool
    batch_size: int = Field(default=5, ge=1, le=10)
    interval_hours: int = Field(default=24, ge=6, le=168)
    enabled_sources: list[Literal["github", "betalist", "hacker_news", "product_hunt"]] | None = Field(default=None, min_length=1, max_length=4)


class WebsiteInput(Record):
    url: str = Field(min_length=4, max_length=500)


class Source(Record):
    id: str
    kind: Literal["website", "pricing", "content", "docs", "repository", "readme", "release", "listing"]
    title: str
    url: str
    collected_at: str
    published_at: str | None = None
    text: str
    links: list[dict[str, str]] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


class Fact(Record):
    text: str
    source_ids: list[str] = Field(min_length=1)


class Action(Record):
    id: str
    title: str
    channel: str
    description: str
    source_ids: list[str] = Field(min_length=1)
    date: str | None = None
    result: str
    evidence_type: Literal["公开动作", "公开入口"]


class Section(Record):
    id: str
    title: str
    intro: str = ""
    facts: list[Fact] = Field(default_factory=list)
    action_ids: list[str] = Field(default_factory=list)


class Report(Record):
    schema_version: Literal["1.0"] = "1.0"
    project_id: str
    version: int = 1
    generated_at: str
    mode: Literal["evidence", "local_model"] = "evidence"
    coverage: Literal["website", "repository", "listing_only"] = "website"
    summary: str
    summary_source_ids: list[str] = Field(default_factory=list)
    translations: dict[str, str] = Field(default_factory=dict)
    sources: list[Source]
    actions: list[Action]
    sections: list[Section]
    metrics: list[dict]
    gaps: list[str]
    warnings: list[str]
    discovered_accounts: list[dict[str, str]]
    website_resolution: dict = Field(default_factory=dict)


class Collection(Record):
    name: str
    description: str
    website: str
    github: str | None = None
    sources: list[Source]
    warnings: list[str]
    discovered_accounts: list[dict[str, str]]
    website_resolution: dict = Field(default_factory=dict)

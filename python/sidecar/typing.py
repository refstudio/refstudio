from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from dataclasses_jsonschema import JsonSchemaMixin


@dataclass
class Reference(JsonSchemaMixin):
    """A reference for an academic paper / PDF"""
    source_filename: str
    filename_md5: str
    title: Optional[str] = None
    abstract: Optional[str] = None
    contents: Optional[str] = None
    authors: List["Author"] = field(default_factory=list)
    chunks: List["Chunk"] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Affiliation(JsonSchemaMixin):
    institution: str
    department: str


@dataclass
class Author(JsonSchemaMixin):
    """The author of a paper."""
    full_name: str
    given_name: str
    surname: str
    email: str


@dataclass
class Chunk(JsonSchemaMixin):
    text: str
    vector: List[float] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class IngestResponse(JsonSchemaMixin):
    project_name: str
    references: list[Reference]


@dataclass
class RewriteChoice(JsonSchemaMixin):
    index: int
    text: str


@dataclass
class CliCommands(JsonSchemaMixin):
    ingest: IngestResponse
    rewrite: list[RewriteChoice]

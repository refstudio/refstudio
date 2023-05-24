from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class Reference:
    source_filename: str
    title: str
    abstract: str
    contents: str
    authors: List["Author"] = field(default_factory=list)
    chunks: List["Chunk"] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Affiliation:
    institution: str
    department: str


@dataclass
class Author:
    full_name: str
    given_name: str
    surname: str
    email: str


@dataclass
class Chunk:
    text: str
    vector: List[float] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class Reference:
    source_filename: str
    filename_md5: str
    citation_key: Optional[str] = None
    title: Optional[str] = None
    abstract: Optional[str] = None
    contents: Optional[str] = None
    published_date: Optional[datetime] = None
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
    given_name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None


@dataclass
class Chunk:
    text: str
    vector: List[float] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

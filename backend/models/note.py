from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(BaseModel):
    id: str
    description: str
    completed: bool = False
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Attachment(BaseModel):
    id: str
    name: str
    file_type: str
    size: int
    url: str
    uploaded_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HistoryEntry(BaseModel):
    id: str
    timestamp: datetime
    action: str
    summary: str
    modified_by: Optional[str] = None
    file_changes: Optional[List[dict]] = None

class NoteBase(BaseModel):
    title: str
    content: str
    category: str = "Personal"
    keywords: List[str] = Field(default_factory=list)

class NoteCreate(NoteBase):
    connections: Optional[List[str]] = Field(default_factory=list)
    tasks: Optional[List[Task]] = Field(default_factory=list)
    attachments: Optional[List[Attachment]] = Field(default_factory=list)

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    keywords: Optional[List[str]] = None
    connections: Optional[List[str]] = None
    tasks: Optional[List[Task]] = None
    attachments: Optional[List[Attachment]] = None


class NoteResponse(NoteBase):
    id: str = Field(alias="_id")
    author: str
    corporation_id: Optional[str] = None
    connections: List[str] = Field(default_factory=list)
    tasks: List[Task] = Field(default_factory=list)
    attachments: List[Attachment] = Field(default_factory=list)
    history: List[HistoryEntry] = Field(default_factory=list)
    location: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None
    access_count: int = 0
    last_accessed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

class NoteInDB(NoteBase):
    id: str = Field(alias="_id")
    author: str
    corporation_id: Optional[str] = None
    connections: List[str] = Field(default_factory=list)
    tasks: List[Task] = Field(default_factory=list)
    attachments: List[Attachment] = Field(default_factory=list)
    history: List[HistoryEntry] = Field(default_factory=list)
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None
    access_count: int = 0
    last_accessed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

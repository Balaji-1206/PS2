from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field

class HierarchyItem(BaseModel):
    level: int
    title: str
    page: int = 1

class SectionItem(BaseModel):
    title: str
    page: int = 1
    paragraph_ids: List[str] = Field(default_factory=list)

class TableItem(BaseModel):
    page: int = 1
    rows: int
    columns: int
    cell_values: List[List[str]] = Field(default_factory=list)

class ParagraphItem(BaseModel):
    id: str
    text: str
    page: int = 1
    section: Optional[str] = None
    reading_order: int = 0

class ExtractedContent(BaseModel):
    hierarchy: List[HierarchyItem] = Field(default_factory=list)
    sections: List[SectionItem] = Field(default_factory=list)
    tables: List[TableItem] = Field(default_factory=list)
    paragraphs: List[ParagraphItem] = Field(default_factory=list)

class SourceMappingItem(BaseModel):
    id: str
    page: int = 1
    section: Optional[str] = None
    reading_order: int = 0
    bounding_box: Optional[List[float]] = None
    confidence: float = 1.0
    source_pointer: str

class DocumentMetadata(BaseModel):
    filename: Optional[str] = None
    pages: int = 1
    language: Optional[str] = "en"
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExtractionResult(BaseModel):
    document_id: str
    source_type: str
    metadata: DocumentMetadata
    content: ExtractedContent
    source_mapping: List[SourceMappingItem] = Field(default_factory=list)

class ExtractionResponse(BaseModel):
    status: str = "success"
    document_id: str
    source_type: str
    data: Optional[ExtractionResult] = None

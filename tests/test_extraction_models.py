from datetime import datetime, timezone
from extraction.models.extraction_models import (
    HierarchyItem,
    SectionItem,
    TableItem,
    ParagraphItem,
    ExtractedContent,
    SourceMappingItem,
    DocumentMetadata,
    ExtractionResult,
    ExtractionResponse
)

def test_extraction_models_serialization():
    metadata = DocumentMetadata(
        filename="test.pdf",
        pages=2,
        language="en",
        processed_at=datetime.now(timezone.utc)
    )
    hierarchy = [HierarchyItem(level=1, title="Introduction", page=1)]
    paragraphs = [
        ParagraphItem(id="p_0", text="Hello world", page=1, section="Introduction", reading_order=0)
    ]
    sections = [SectionItem(title="Introduction", page=1, paragraph_ids=["p_0"])]
    tables = [
        TableItem(page=1, rows=2, columns=2, cell_values=[["A", "B"], ["1", "2"]])
    ]
    content = ExtractedContent(
        hierarchy=hierarchy,
        sections=sections,
        tables=tables,
        paragraphs=paragraphs
    )
    source_mapping = [
        SourceMappingItem(
            id="block_0",
            page=1,
            section="Introduction",
            reading_order=0,
            bounding_box=[10.0, 20.0, 300.0, 40.0],
            confidence=0.99,
            source_pointer="doc_123#p_0"
        )
    ]
    result = ExtractionResult(
        document_id="doc_123",
        source_type="pdf",
        metadata=metadata,
        content=content,
        source_mapping=source_mapping
    )
    serialized = result.model_dump(mode="json")
    assert serialized["document_id"] == "doc_123"
    assert serialized["source_type"] == "pdf"
    assert serialized["content"]["paragraphs"][0]["text"] == "Hello world"
    assert serialized["source_mapping"][0]["confidence"] == 0.99

def test_extraction_response_wrapper():
    metadata = DocumentMetadata(filename="test.txt", pages=1)
    result = ExtractionResult(
        document_id="doc_456",
        source_type="txt",
        metadata=metadata,
        content=ExtractedContent(),
        source_mapping=[]
    )
    response = ExtractionResponse(
        status="success",
        document_id="doc_456",
        source_type="txt",
        data=result
    )
    serialized = response.model_dump(mode="json")
    assert serialized["status"] == "success"
    assert serialized["data"]["document_id"] == "doc_456"

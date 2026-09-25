from extraction.utils.source_mapper import SourceMapper
from extraction.models.extraction_models import ParagraphItem

def test_source_mapper_creation():
    mapper = SourceMapper(document_id="doc_test123")
    paragraph = ParagraphItem(id="p_0", text="Introduction text", page=1, section="Intro", reading_order=0)
    mapping = mapper.create_mapping(
        item_id=paragraph.id,
        page=1,
        section="Intro",
        reading_order=0,
        bounding_box=[10.0, 20.0, 100.0, 30.0],
        confidence=0.98
    )
    assert mapping.id == "block_0"
    assert mapping.source_pointer == "doc_test123#p_0"
    assert mapping.bounding_box == [10.0, 20.0, 100.0, 30.0]
    assert mapping.confidence == 0.98

def test_source_mapper_incrementing_ids():
    mapper = SourceMapper(document_id="doc_test123")
    m1 = mapper.create_mapping(item_id="p_0")
    m2 = mapper.create_mapping(item_id="p_1")
    assert m1.id == "block_0"
    assert m2.id == "block_1"
    assert m2.source_pointer == "doc_test123#p_1"

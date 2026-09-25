from pathlib import Path
from unittest.mock import MagicMock, patch
from extraction.processors.docling_processor import DoclingProcessor
from extraction.processors.image_processor import ImageProcessor

def test_docling_processor_structure():
    processor = DoclingProcessor()
    assert processor is not None

def test_docling_conversion_mapping():
    processor = DoclingProcessor()
    mock_doc = MagicMock()
    mock_doc.num_pages.return_value = 2

    # Mock heading item
    mock_heading = MagicMock()
    mock_heading.label = "section_header"
    mock_heading.text = "Introduction"
    mock_heading.prov = [MagicMock(page_no=1, bbox=MagicMock(l=10, t=20, r=100, b=40))]

    # Mock text item
    mock_p = MagicMock()
    mock_p.label = "text"
    mock_p.text = "Body text here"
    mock_p.prov = [MagicMock(page_no=1, bbox=MagicMock(l=10, t=50, r=200, b=70))]

    mock_doc.iterate_items.return_value = [
        (mock_heading, 0),
        (mock_p, 0)
    ]
    mock_doc.tables = []

    content, mappings, pages = processor._map_docling_document(mock_doc, "doc_test")
    assert pages == 2
    assert len(content.hierarchy) == 1
    assert content.hierarchy[0].title == "Introduction"
    assert len(content.paragraphs) == 1
    assert content.paragraphs[0].text == "Body text here"
    assert len(mappings) == 1
    assert mappings[0].bounding_box == [10.0, 50.0, 200.0, 70.0]

def test_image_processor_delegation():
    mock_docling = MagicMock()
    mock_docling.convert.return_value = (MagicMock(), [], 1)
    image_proc = ImageProcessor(docling_processor=mock_docling)
    content, mappings, pages = image_proc.process(Path("dummy.png"), "doc_img1")
    mock_docling.convert.assert_called_once_with(Path("dummy.png"), "doc_img1")
    assert pages == 1

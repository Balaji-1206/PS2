from extraction.processors.text_processor import TextProcessor

def test_markdown_extraction():
    processor = TextProcessor()
    markdown_content = """# Executive Summary
This is the executive summary paragraph.

## Financials
Revenue increased by 20 percent.
Expenses remained flat.
"""
    content, mappings = processor.process(
        text=markdown_content,
        document_id="doc_text_01",
        source_type="md"
    )
    assert len(content.hierarchy) == 2
    assert content.hierarchy[0].title == "Executive Summary"
    assert content.hierarchy[0].level == 1
    assert content.hierarchy[1].title == "Financials"
    assert content.hierarchy[1].level == 2

    assert len(content.paragraphs) == 3
    assert content.paragraphs[0].text == "This is the executive summary paragraph."
    assert content.paragraphs[0].section == "Executive Summary"
    assert content.paragraphs[1].section == "Financials"
    assert content.paragraphs[2].section == "Financials"

    assert len(mappings) == 3
    assert mappings[0].source_pointer == "doc_text_01#p_0"
    assert mappings[0].confidence == 1.0

def test_plain_text_extraction():
    processor = TextProcessor()
    plain_content = "Line 1.\nLine 2.\nLine 3."
    content, mappings = processor.process(
        text=plain_content,
        document_id="doc_text_02",
        source_type="txt"
    )
    assert len(content.paragraphs) == 3
    assert len(content.sections) == 1
    assert content.sections[0].title == "General"
    assert content.sections[0].paragraph_ids == ["p_0", "p_1", "p_2"]

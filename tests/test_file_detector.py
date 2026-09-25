import pytest
from extraction.utils.file_detector import detect_file_type, generate_document_id, is_supported_format
from extraction.utils.metadata import build_metadata

def test_file_type_detection():
    assert detect_file_type("report.pdf", b"%PDF-1.5") == "pdf"
    assert detect_file_type("document.docx", b"PK\x03\x04") == "docx"
    assert detect_file_type("readme.txt", b"hello world") == "txt"
    assert detect_file_type("notes.md", b"# Header") == "md"
    assert detect_file_type("index.html", b"<html></html>") == "html"
    assert detect_file_type("image.png", b"\x89PNG\r\n\x1a\n") == "png"
    assert detect_file_type("photo.jpg", b"\xff\xd8\xff") == "jpg"
    assert detect_file_type("photo.jpeg", b"\xff\xd8\xff") == "jpeg"

def test_unsupported_format_raises_error():
    assert not is_supported_format("audio.mp3")
    with pytest.raises(ValueError, match="Unsupported file format"):
        detect_file_type("archive.zip", b"PK\x05\x06")

def test_generate_document_id():
    doc_id = generate_document_id()
    assert doc_id.startswith("doc_")
    assert len(doc_id) >= 12

def test_build_metadata():
    meta = build_metadata(filename="sample.pdf", pages=5, language="en")
    assert meta.filename == "sample.pdf"
    assert meta.pages == 5
    assert meta.language == "en"
    assert meta.processed_at is not None

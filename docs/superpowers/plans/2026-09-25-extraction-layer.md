# Multi-Format Extraction Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular multi-format document extraction microservice using FastAPI and Docling that normalizes PDFs, DOCX, images, text, and URLs into a canonical structured JSON with source-mapping traceability.

**Architecture:** A layered microservice architecture featuring input detection, dedicated format processors (Docling for PDF/DOCX/Images, clean HTML extraction for URLs, AST parsing for Markdown/Text), a canonical source mapper calculating reading order and bounding boxes, and local JSON storage exposed via FastAPI REST endpoints.

**Tech Stack:** Python 3.10+, FastAPI, Uvicorn, Docling, Pydantic v2, HTTPX, BeautifulSoup4, Pytest.

**Spec:** [`docs/superpowers/specs/2026-09-25-extraction-layer-design.md`](file:///c:/Projects/PS2/docs/superpowers/specs/2026-09-25-extraction-layer-design.md)

## Global Constraints

- Python runtime: Python 3.10+ in `.venv`.
- Output format: All extractions must conform to the canonical `ExtractionResult` JSON schema.
- Traceability: Every extracted paragraph, section, and table must include source mapping (page, section, reading order, coordinates, confidence).
- REST Endpoints: `POST /extract` and `GET /extract/{document_id}` with consistent error JSON (`{"status": "error", "message": "..."}`).
- Code cleanliness: Strict adherence to clean code (small focused functions, typed signatures, no magic numbers).

---

### Task 1: Environment & Dependency Setup

**Files:**
- Create: `extraction/requirements.txt`
- Create: `tests/conftest.py`
- Modify: `extraction/README.md`

**Interfaces:**
- Produces: Installed `.venv` with FastAPI, Docling, Pydantic, HTTPX, Pytest.

- [ ] **Step 1: Write requirements.txt**

```txt
fastapi>=0.115.0
uvicorn>=0.30.0
pydantic>=2.8.0
python-multipart>=0.0.12
docling>=2.0.0
httpx>=0.27.0
beautifulsoup4>=4.12.0
pytest>=8.0.0
pytest-asyncio>=0.24.0
```

- [ ] **Step 2: Create test conftest.py**

```python
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
```

- [ ] **Step 3: Install dependencies in .venv**

Run: `.\.venv\Scripts\python.exe -m pip install -r extraction/requirements.txt`
Expected: Successfully installed all dependencies in `.venv`.

- [ ] **Step 4: Verify test runner**

Run: `.\.venv\Scripts\python.exe -m pytest -v`
Expected: `no tests ran in 0.01s` (exit code 5 or 0)

- [ ] **Step 5: Commit**

```bash
git add extraction/requirements.txt tests/conftest.py extraction/README.md
git commit -m "build: configure extraction dependencies and test runner"
```

---

### Task 2: Canonical Extraction Data Models

**Files:**
- Create: `extraction/models/__init__.py`
- Create: `extraction/models/extraction_models.py`
- Create: `tests/test_extraction_models.py`

**Interfaces:**
- Produces: `HierarchyItem`, `SectionItem`, `TableItem`, `ParagraphItem`, `ExtractedContent`, `SourceMappingItem`, `DocumentMetadata`, `ExtractionResult`, `ExtractionResponse`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_extraction_models.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_extraction_models.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'extraction.models')

- [ ] **Step 3: Implement extraction_models.py**

```python
# extraction/models/extraction_models.py
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_extraction_models.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/models/ tests/test_extraction_models.py
git commit -m "feat(models): add canonical extraction data models"
```

---

### Task 3: Input Processing & File Detector Utility

**Files:**
- Create: `extraction/utils/__init__.py`
- Create: `extraction/utils/file_detector.py`
- Create: `extraction/utils/metadata.py`
- Create: `tests/test_file_detector.py`

**Interfaces:**
- Consumes: Raw filename, content bytes, MIME type.
- Produces: `detect_file_type(filename: str, content: bytes) -> str`, `generate_document_id() -> str`, `build_metadata(...) -> DocumentMetadata`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_file_detector.py
import pytest
from extraction.utils.file_detector import detect_file_type, generate_document_id, is_supported_format

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_file_detector.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'extraction.utils')

- [ ] **Step 3: Implement file_detector.py and metadata.py**

```python
# extraction/utils/file_detector.py
import os
import uuid
from typing import Set

SUPPORTED_EXTENSIONS: Set[str] = {
    "pdf", "docx", "txt", "md", "html", "png", "jpg", "jpeg"
}

def generate_document_id() -> str:
    return f"doc_{uuid.uuid4().hex[:8]}"

def is_supported_format(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in SUPPORTED_EXTENSIONS

def detect_file_type(filename: str, content: bytes = b"") -> str:
    if not filename or "." not in filename:
        raise ValueError(f"Unsupported file format: {filename}")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file format: .{ext}")
    return ext
```

```python
# extraction/utils/metadata.py
from datetime import datetime, timezone
from typing import Optional
from extraction.models.extraction_models import DocumentMetadata

def build_metadata(
    filename: Optional[str] = None,
    pages: int = 1,
    language: str = "en"
) -> DocumentMetadata:
    return DocumentMetadata(
        filename=filename,
        pages=max(1, pages),
        language=language,
        processed_at=datetime.now(timezone.utc)
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_file_detector.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/utils/ tests/test_file_detector.py
git commit -m "feat(utils): add file detector and metadata generator"
```

---

### Task 4: Source Mapping & Layout Normalizer

**Files:**
- Create: `extraction/utils/source_mapper.py`
- Create: `tests/test_source_mapper.py`

**Interfaces:**
- Consumes: Extracted items, coordinates, bounding boxes.
- Produces: `SourceMapper.create_mapping(...) -> SourceMappingItem`, `SourceMapper.aggregate_content(...) -> ExtractedContent`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_source_mapper.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_source_mapper.py -v`
Expected: FAIL (ImportError: cannot import name 'SourceMapper')

- [ ] **Step 3: Implement source_mapper.py**

```python
# extraction/utils/source_mapper.py
from typing import List, Optional
from extraction.models.extraction_models import SourceMappingItem

class SourceMapper:
    def __init__(self, document_id: str):
        self.document_id = document_id
        self._counter = 0

    def create_mapping(
        self,
        item_id: str,
        page: int = 1,
        section: Optional[str] = None,
        reading_order: int = 0,
        bounding_box: Optional[List[float]] = None,
        confidence: float = 1.0
    ) -> SourceMappingItem:
        block_id = f"block_{self._counter}"
        self._counter += 1
        return SourceMappingItem(
            id=block_id,
            page=page,
            section=section,
            reading_order=reading_order,
            bounding_box=bounding_box,
            confidence=confidence,
            source_pointer=f"{self.document_id}#{item_id}"
        )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_source_mapper.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/utils/source_mapper.py tests/test_source_mapper.py
git commit -m "feat(utils): add source mapper for layout coordinates and traceability"
```

---

### Task 5: Text & Markdown Processor

**Files:**
- Create: `extraction/processors/__init__.py`
- Create: `extraction/processors/text_processor.py`
- Create: `tests/test_text_processor.py`

**Interfaces:**
- Consumes: Raw text or markdown string, `document_id: str`.
- Produces: `TextProcessor.process(text: str, document_id: str, source_type: str) -> (ExtractedContent, List[SourceMappingItem])`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_text_processor.py
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

    assert len(mappings) == 3
    assert mappings[0].source_pointer == "doc_text_01#p_0"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_text_processor.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'extraction.processors')

- [ ] **Step 3: Implement text_processor.py**

```python
# extraction/processors/text_processor.py
import re
from typing import Tuple, List
from extraction.models.extraction_models import (
    ExtractedContent,
    HierarchyItem,
    SectionItem,
    ParagraphItem,
    SourceMappingItem
)
from extraction.utils.source_mapper import SourceMapper

class TextProcessor:
    def process(
        self,
        text: str,
        document_id: str,
        source_type: str = "txt"
    ) -> Tuple[ExtractedContent, List[SourceMappingItem]]:
        mapper = SourceMapper(document_id=document_id)
        hierarchy: List[HierarchyItem] = []
        sections: List[SectionItem] = []
        paragraphs: List[ParagraphItem] = []
        mappings: List[SourceMappingItem] = []

        current_section = "General"
        current_section_p_ids: List[str] = []
        reading_order = 0

        lines = [line.strip() for line in text.splitlines() if line.strip()]
        for line in lines:
            # Check for Markdown heading: # Title, ## Subtitle
            header_match = re.match(r"^(#{1,6})\s+(.*)$", line)
            if header_match:
                level = len(header_match.group(1))
                title = header_match.group(2).strip()
                hierarchy.append(HierarchyItem(level=level, title=title, page=1))
                if current_section_p_ids:
                    sections.append(SectionItem(
                        title=current_section,
                        page=1,
                        paragraph_ids=list(current_section_p_ids)
                    ))
                    current_section_p_ids = []
                current_section = title
            else:
                p_id = f"p_{reading_order}"
                paragraphs.append(ParagraphItem(
                    id=p_id,
                    text=line,
                    page=1,
                    section=current_section,
                    reading_order=reading_order
                ))
                mappings.append(mapper.create_mapping(
                    item_id=p_id,
                    page=1,
                    section=current_section,
                    reading_order=reading_order,
                    bounding_box=None,
                    confidence=1.0
                ))
                current_section_p_ids.append(p_id)
                reading_order += 1

        if current_section_p_ids:
            sections.append(SectionItem(
                title=current_section,
                page=1,
                paragraph_ids=current_section_p_ids
            ))

        content = ExtractedContent(
            hierarchy=hierarchy,
            sections=sections,
            tables=[],
            paragraphs=paragraphs
        )
        return content, mappings
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_text_processor.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/processors/ tests/test_text_processor.py
git commit -m "feat(processors): add text and markdown extraction processor"
```

---

### Task 6: URL Processor

**Files:**
- Create: `extraction/processors/url_processor.py`
- Create: `tests/test_url_processor.py`

**Interfaces:**
- Consumes: URL string, HTTP client.
- Produces: `UrlProcessor.fetch_and_clean(url: str) -> (str, str)` (title, clean_text_or_markdown).

- [ ] **Step 1: Write the failing test**

```python
# tests/test_url_processor.py
import pytest
from unittest.mock import patch, MagicMock
from extraction.processors.url_processor import UrlProcessor

@pytest.mark.asyncio
async def test_url_fetch_and_clean():
    processor = UrlProcessor()
    mock_html = """
    <html>
        <head><title>Company News</title></head>
        <body>
            <nav><a href="/home">Home</a></nav>
            <h1>Quarterly Update</h1>
            <p>Our revenue grew significantly this quarter.</p>
            <footer><p>&copy; 2026 Company</p></footer>
        </body>
    </html>
    """
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = mock_html
        mock_get.return_value = mock_response

        title, cleaned_text = await processor.fetch_and_clean("https://example.com/news")
        assert title == "Company News"
        assert "Quarterly Update" in cleaned_text
        assert "Our revenue grew significantly" in cleaned_text
        assert "Home" not in cleaned_text  # Nav removed
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_url_processor.py -v`
Expected: FAIL (ModuleNotFoundError: cannot import 'UrlProcessor')

- [ ] **Step 3: Implement url_processor.py**

```python
# extraction/processors/url_processor.py
from typing import Tuple
import httpx
from bs4 import BeautifulSoup

class UrlProcessor:
    def __init__(self, timeout: float = 15.0):
        self.timeout = timeout

    async def fetch_and_clean(self, url: str) -> Tuple[str, str]:
        if not url.startswith(("http://", "https://")):
            raise ValueError(f"Invalid URL schema: {url}")

        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code >= 400:
                raise ValueError(f"Failed to fetch URL {url} with status {response.status_code}")
            html_content = response.text

        soup = BeautifulSoup(html_content, "html.parser")
        
        # Remove navigation, headers, footers, scripts, styles
        for tag in soup(["nav", "header", "footer", "script", "style", "aside"]):
            tag.decompose()

        title = soup.title.string.strip() if soup.title and soup.title.string else "Web Page"

        lines = []
        for elem in soup.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
            text = elem.get_text(separator=" ", strip=True)
            if not text:
                continue
            if elem.name == "h1":
                lines.append(f"# {text}")
            elif elem.name == "h2":
                lines.append(f"## {text}")
            elif elem.name in ["h3", "h4"]:
                lines.append(f"### {text}")
            else:
                lines.append(text)

        cleaned_markdown = "\n\n".join(lines)
        return title, cleaned_markdown
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_url_processor.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/processors/url_processor.py tests/test_url_processor.py
git commit -m "feat(processors): add URL fetching and content cleaning processor"
```

---

### Task 7: Docling Processor (PDF, DOCX, Image OCR)

**Files:**
- Create: `extraction/processors/docling_processor.py`
- Create: `extraction/processors/image_processor.py`
- Create: `tests/test_docling_processor.py`

**Interfaces:**
- Consumes: File path or stream (`.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`, `.html`), `document_id: str`.
- Produces: `DoclingProcessor.convert(file_path: Path, document_id: str) -> (ExtractedContent, List[SourceMappingItem], int)`.

- [ ] **Step 1: Write the test with mock Docling converter**

```python
# tests/test_docling_processor.py
from pathlib import Path
from unittest.mock import MagicMock, patch
from extraction.processors.docling_processor import DoclingProcessor

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_docling_processor.py -v`
Expected: FAIL (cannot import DoclingProcessor)

- [ ] **Step 3: Implement docling_processor.py and image_processor.py**

```python
# extraction/processors/docling_processor.py
from pathlib import Path
from typing import Tuple, List, Any
from docling.document_converter import DocumentConverter
from extraction.models.extraction_models import (
    ExtractedContent,
    HierarchyItem,
    SectionItem,
    TableItem,
    ParagraphItem,
    SourceMappingItem
)
from extraction.utils.source_mapper import SourceMapper

class DoclingProcessor:
    def __init__(self):
        self._converter = None

    @property
    def converter(self) -> DocumentConverter:
        if self._converter is None:
            self._converter = DocumentConverter()
        return self._converter

    def convert(self, file_path: Path, document_id: str) -> Tuple[ExtractedContent, List[SourceMappingItem], int]:
        result = self.converter.convert(file_path)
        doc = result.document
        return self._map_docling_document(doc, document_id)

    def _map_docling_document(
        self,
        doc: Any,
        document_id: str
    ) -> Tuple[ExtractedContent, List[SourceMappingItem], int]:
        mapper = SourceMapper(document_id=document_id)
        hierarchy: List[HierarchyItem] = []
        sections: List[SectionItem] = []
        paragraphs: List[ParagraphItem] = []
        mappings: List[SourceMappingItem] = []
        tables: List[TableItem] = []

        current_section = "General"
        current_section_p_ids: List[str] = []
        reading_order = 0

        # Extract items (headings and text)
        for item, _ in doc.iterate_items():
            label = getattr(item, "label", "")
            text = getattr(item, "text", "").strip()
            if not text:
                continue

            page_no = 1
            bbox_coords = None
            prov_list = getattr(item, "prov", [])
            if prov_list:
                first_prov = prov_list[0]
                page_no = getattr(first_prov, "page_no", 1)
                bbox = getattr(first_prov, "bbox", None)
                if bbox:
                    bbox_coords = [
                        float(getattr(bbox, "l", 0.0)),
                        float(getattr(bbox, "t", 0.0)),
                        float(getattr(bbox, "r", 0.0)),
                        float(getattr(bbox, "b", 0.0)),
                    ]

            if "header" in str(label).lower() or "title" in str(label).lower():
                level = 1 if "title" in str(label).lower() else 2
                hierarchy.append(HierarchyItem(level=level, title=text, page=page_no))
                if current_section_p_ids:
                    sections.append(SectionItem(
                        title=current_section,
                        page=page_no,
                        paragraph_ids=list(current_section_p_ids)
                    ))
                    current_section_p_ids = []
                current_section = text
            else:
                p_id = f"p_{reading_order}"
                paragraphs.append(ParagraphItem(
                    id=p_id,
                    text=text,
                    page=page_no,
                    section=current_section,
                    reading_order=reading_order
                ))
                mappings.append(mapper.create_mapping(
                    item_id=p_id,
                    page=page_no,
                    section=current_section,
                    reading_order=reading_order,
                    bounding_box=bbox_coords,
                    confidence=0.98
                ))
                current_section_p_ids.append(p_id)
                reading_order += 1

        if current_section_p_ids:
            sections.append(SectionItem(
                title=current_section,
                page=1,
                paragraph_ids=current_section_p_ids
            ))

        # Extract tables
        for table in getattr(doc, "tables", []):
            table_page = 1
            if getattr(table, "prov", None):
                table_page = getattr(table.prov[0], "page_no", 1)
            
            # Export table to list of rows
            data_rows = []
            if hasattr(table, "export_to_dataframe"):
                df = table.export_to_dataframe()
                data_rows = [df.columns.tolist()] + df.values.tolist()
                data_rows = [[str(cell) for cell in row] for row in data_rows]

            tables.append(TableItem(
                page=table_page,
                rows=len(data_rows),
                columns=len(data_rows[0]) if data_rows else 0,
                cell_values=data_rows
            ))

        total_pages = 1
        if hasattr(doc, "num_pages") and callable(doc.num_pages):
            total_pages = doc.num_pages()
        elif hasattr(doc, "pages"):
            total_pages = len(doc.pages)

        content = ExtractedContent(
            hierarchy=hierarchy,
            sections=sections,
            tables=tables,
            paragraphs=paragraphs
        )
        return content, mappings, max(1, total_pages)
```

```python
# extraction/processors/image_processor.py
from pathlib import Path
from typing import Tuple, List
from extraction.processors.docling_processor import DoclingProcessor
from extraction.models.extraction_models import ExtractedContent, SourceMappingItem

class ImageProcessor:
    def __init__(self, docling_processor: DoclingProcessor):
        self.docling_processor = docling_processor

    def process(self, image_path: Path, document_id: str) -> Tuple[ExtractedContent, List[SourceMappingItem], int]:
        return self.docling_processor.convert(image_path, document_id)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_docling_processor.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/processors/ tests/test_docling_processor.py
git commit -m "feat(processors): add Docling document converter and image OCR processor"
```

---

### Task 8: Storage Service for Extraction Artifacts

**Files:**
- Create: `extraction/services/__init__.py`
- Create: `extraction/services/storage_service.py`
- Create: `tests/test_storage_service.py`

**Interfaces:**
- Consumes: `ExtractionResult`.
- Produces: `StorageService.save(result: ExtractionResult) -> Path`, `StorageService.get(document_id: str) -> Optional[ExtractionResult]`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_storage_service.py
import pytest
from pathlib import Path
from extraction.services.storage_service import StorageService
from extraction.models.extraction_models import (
    ExtractionResult,
    DocumentMetadata,
    ExtractedContent
)

def test_storage_save_and_retrieve(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    result = ExtractionResult(
        document_id="doc_storage_test",
        source_type="txt",
        metadata=DocumentMetadata(filename="test.txt", pages=1),
        content=ExtractedContent(),
        source_mapping=[]
    )
    saved_path = storage.save(result)
    assert saved_path.exists()

    retrieved = storage.get("doc_storage_test")
    assert retrieved is not None
    assert retrieved.document_id == "doc_storage_test"
    assert retrieved.source_type == "txt"

def test_storage_not_found(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    assert storage.get("non_existent_doc") is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_storage_service.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'extraction.services')

- [ ] **Step 3: Implement storage_service.py**

```python
# extraction/services/storage_service.py
import json
from pathlib import Path
from typing import Optional, Dict
from extraction.models.extraction_models import ExtractionResult

DEFAULT_STORAGE_DIR = Path(__file__).resolve().parent.parent / "storage" / "extracted_json"

class StorageService:
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DEFAULT_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, ExtractionResult] = {}

    def save(self, result: ExtractionResult) -> Path:
        self._cache[result.document_id] = result
        file_path = self.storage_dir / f"{result.document_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(result.model_dump_json(indent=2))
        return file_path

    def get(self, document_id: str) -> Optional[ExtractionResult]:
        if document_id in self._cache:
            return self._cache[document_id]

        file_path = self.storage_dir / f"{document_id}.json"
        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            result = ExtractionResult.model_validate(data)
            self._cache[document_id] = result
            return result
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_storage_service.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/services/ tests/test_storage_service.py
git commit -m "feat(services): add filesystem JSON storage service with cache"
```

---

### Task 9: Core Extraction Orchestrator Service

**Files:**
- Create: `extraction/services/extraction_service.py`
- Create: `tests/test_extraction_service.py`

**Interfaces:**
- Consumes: Upload file bytes, text, or URL, plus processors & storage service.
- Produces: `ExtractionService.extract(...) -> ExtractionResult`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_extraction_service.py
import pytest
from pathlib import Path
from extraction.services.extraction_service import ExtractionService
from extraction.services.storage_service import StorageService

@pytest.mark.asyncio
async def test_extraction_service_with_text(tmp_path: Path):
    storage = StorageService(storage_dir=tmp_path)
    service = ExtractionService(storage_service=storage)

    result = await service.extract_text(
        text="# Title\nFirst paragraph.",
        source_type="md"
    )
    assert result.document_id.startswith("doc_")
    assert result.source_type == "md"
    assert len(result.content.hierarchy) == 1
    assert len(result.content.paragraphs) == 1
    assert storage.get(result.document_id) is not None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_extraction_service.py -v`
Expected: FAIL (cannot import ExtractionService)

- [ ] **Step 3: Implement extraction_service.py**

```python
# extraction/services/extraction_service.py
import tempfile
from pathlib import Path
from typing import Optional
from extraction.models.extraction_models import ExtractionResult
from extraction.processors.docling_processor import DoclingProcessor
from extraction.processors.image_processor import ImageProcessor
from extraction.processors.text_processor import TextProcessor
from extraction.processors.url_processor import UrlProcessor
from extraction.services.storage_service import StorageService
from extraction.utils.file_detector import detect_file_type, generate_document_id
from extraction.utils.metadata import build_metadata

class ExtractionService:
    def __init__(
        self,
        storage_service: Optional[StorageService] = None,
        docling_processor: Optional[DoclingProcessor] = None,
        text_processor: Optional[TextProcessor] = None,
        url_processor: Optional[UrlProcessor] = None
    ):
        self.storage = storage_service or StorageService()
        self.docling_processor = docling_processor or DoclingProcessor()
        self.image_processor = ImageProcessor(self.docling_processor)
        self.text_processor = text_processor or TextProcessor()
        self.url_processor = url_processor or UrlProcessor()

    async def extract_text(
        self,
        text: str,
        source_type: str = "txt",
        filename: Optional[str] = None
    ) -> ExtractionResult:
        doc_id = generate_document_id()
        content, mappings = self.text_processor.process(text, doc_id, source_type)
        metadata = build_metadata(filename=filename or f"text_input.{source_type}", pages=1)
        result = ExtractionResult(
            document_id=doc_id,
            source_type=source_type,
            metadata=metadata,
            content=content,
            source_mapping=mappings
        )
        self.storage.save(result)
        return result

    async def extract_url(self, url: str) -> ExtractionResult:
        doc_id = generate_document_id()
        title, clean_markdown = await self.url_processor.fetch_and_clean(url)
        content, mappings = self.text_processor.process(clean_markdown, doc_id, "url")
        metadata = build_metadata(filename=url, pages=1)
        result = ExtractionResult(
            document_id=doc_id,
            source_type="url",
            metadata=metadata,
            content=content,
            source_mapping=mappings
        )
        self.storage.save(result)
        return result

    async def extract_file(
        self,
        filename: str,
        content_bytes: bytes
    ) -> ExtractionResult:
        doc_id = generate_document_id()
        ext = detect_file_type(filename, content_bytes)

        if ext in ["txt", "md"]:
            text_str = content_bytes.decode("utf-8", errors="replace")
            content, mappings = self.text_processor.process(text_str, doc_id, ext)
            metadata = build_metadata(filename=filename, pages=1)
            result = ExtractionResult(
                document_id=doc_id,
                source_type=ext,
                metadata=metadata,
                content=content,
                source_mapping=mappings
            )
            self.storage.save(result)
            return result

        # Binary/Docling formats: PDF, DOCX, Images, HTML
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp_file:
            tmp_file.write(content_bytes)
            tmp_path = Path(tmp_file.name)

        try:
            content, mappings, pages = self.docling_processor.convert(tmp_path, doc_id)
            metadata = build_metadata(filename=filename, pages=pages)
            result = ExtractionResult(
                document_id=doc_id,
                source_type=ext,
                metadata=metadata,
                content=content,
                source_mapping=mappings
            )
            self.storage.save(result)
            return result
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_extraction_service.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add extraction/services/extraction_service.py tests/test_extraction_service.py
git commit -m "feat(services): add core extraction orchestrator service"
```

---

### Task 10: FastAPI Application & REST API Endpoints

**Files:**
- Create: `extraction/api/__init__.py`
- Create: `extraction/api/schemas.py`
- Create: `extraction/api/routes.py`
- Create: `extraction/main.py`
- Create: `tests/test_api_endpoints.py`

**Interfaces:**
- Produces: `POST /extract` (multipart/form-data for file, URL, text), `GET /extract/{document_id}`, `GET /health`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_api_endpoints.py
import pytest
from httpx import AsyncClient, ASGITransport
from extraction.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_extract_text_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/extract", data={"text": "# Heading\nParagraph content"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        doc_id = data["document_id"]
        assert doc_id.startswith("doc_")

        # Retrieve
        get_res = await client.get(f"/extract/{doc_id}")
        assert get_res.status_code == 200
        retrieved = get_res.json()
        assert retrieved["document_id"] == doc_id
        assert retrieved["content"]["paragraphs"][0]["text"] == "Paragraph content"

@pytest.mark.asyncio
async def test_extract_missing_inputs_returns_400():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/extract", data={})
        assert res.status_code == 400
        assert "message" in res.json()

@pytest.mark.asyncio
async def test_extract_not_found_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/extract/doc_non_existent")
        assert res.status_code == 404
        assert "not found" in res.json()["message"].lower()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_api_endpoints.py -v`
Expected: FAIL (ModuleNotFoundError: No module named 'extraction.main')

- [ ] **Step 3: Implement schemas.py, routes.py, and main.py**

```python
# extraction/api/schemas.py
from typing import Optional
from pydantic import BaseModel
from extraction.models.extraction_models import ExtractionResult

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str

class ExtractionAPIResponse(BaseModel):
    status: str = "success"
    document_id: str
    source_type: str
    data: Optional[ExtractionResult] = None
```

```python
# extraction/api/routes.py
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from extraction.api.schemas import ExtractionAPIResponse, ErrorResponse
from extraction.models.extraction_models import ExtractionResult
from extraction.services.extraction_service import ExtractionService

router = APIRouter()
extraction_service = ExtractionService()

@router.post(
    "/extract",
    response_model=ExtractionAPIResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def extract_content(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    text: Optional[str] = Form(None)
):
    if not file and not url and not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide at least one of: file, url, or text."
        )

    try:
        if file is not None:
            content_bytes = await file.read()
            if not content_bytes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded file is empty."
                )
            result = await extraction_service.extract_file(file.filename or "uploaded_file", content_bytes)
        elif url is not None:
            result = await extraction_service.extract_url(url.strip())
        else:
            result = await extraction_service.extract_text(text or "", source_type="text")

        return ExtractionAPIResponse(
            status="success",
            document_id=result.document_id,
            source_type=result.source_type,
            data=result
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Extraction failure: {str(e)}")

@router.get(
    "/extract/{document_id}",
    response_model=ExtractionResult,
    responses={404: {"model": ErrorResponse}}
)
async def get_extraction(document_id: str):
    result = extraction_service.storage.get(document_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found."
        )
    return result
```

```python
# extraction/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from extraction.api.routes import router as api_router

app = FastAPI(
    title="Multi-Format Extraction Layer",
    description="Governed Content Transformation Platform - Extraction Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"status": "error", "message": str(exc.errors())}
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "extraction-layer", "version": "1.0.0"}

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("extraction.main:app", host="0.0.0.0", port=8000, reload=True)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_api_endpoints.py -v`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `.\.venv\Scripts\python.exe -m pytest tests/ -v`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add extraction/api/ extraction/main.py tests/test_api_endpoints.py
git commit -m "feat(api): add FastAPI REST endpoints and application entry point"
```

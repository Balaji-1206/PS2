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
    """
    Central orchestration service coordinating format detection,
    specialized processor routing, source mapping, and persistence.
    """
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

        # Handle lightweight text/markdown files directly
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

        # Binary/Docling formats: PDF, DOCX, Images (PNG, JPG, JPEG), HTML
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

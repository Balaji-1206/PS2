from pathlib import Path
from typing import Tuple, List, Optional
from extraction.processors.docling_processor import DoclingProcessor
from extraction.models.extraction_models import ExtractedContent, SourceMappingItem

class ImageProcessor:
    """
    Dedicated processor for images (PNG, JPG, JPEG) leveraging
    Docling's OCR pipeline to extract text, reading order, and bounding boxes.
    """
    def __init__(self, docling_processor: Optional[DoclingProcessor] = None):
        self.docling_processor = docling_processor or DoclingProcessor()

    def process(self, image_path: Path, document_id: str) -> Tuple[ExtractedContent, List[SourceMappingItem], int]:
        return self.docling_processor.convert(image_path, document_id)

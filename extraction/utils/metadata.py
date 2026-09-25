from datetime import datetime, timezone
from typing import Optional
from extraction.models.extraction_models import DocumentMetadata

def build_metadata(
    filename: Optional[str] = None,
    pages: int = 1,
    language: str = "en"
) -> DocumentMetadata:
    """Build canonical DocumentMetadata with UTC timestamp and validated page count."""
    return DocumentMetadata(
        filename=filename,
        pages=max(1, pages),
        language=language,
        processed_at=datetime.now(timezone.utc)
    )

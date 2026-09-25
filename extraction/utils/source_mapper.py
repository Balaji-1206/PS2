from typing import List, Optional
from extraction.models.extraction_models import SourceMappingItem

class SourceMapper:
    """
    Maintains traceability and source mapping for extracted elements,
    tracking bounding box coordinates, reading sequence, page index, and pointers.
    """
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

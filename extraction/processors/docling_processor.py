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
    """
    Wraps Docling's DocumentConverter to extract hierarchical document content,
    tables, paragraphs, and spatial bounding boxes for PDFs, DOCX, and Images with OCR.
    """
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

            label_str = str(label).lower()
            if "header" in label_str or "title" in label_str:
                level = 1 if "title" in label_str else 2
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

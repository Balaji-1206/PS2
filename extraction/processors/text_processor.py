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
    """
    Extracts structured hierarchical content, headings, and paragraphs
    from raw text, plain text, and Markdown documents.
    """
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

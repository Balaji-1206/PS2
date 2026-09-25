# Extraction Module — Multi-Format Extraction Layer

Governed Content Transformation Platform's extraction service built on FastAPI and Docling.

## Supported Formats
- **Paged Documents**: PDF
- **Word Documents**: DOCX
- **Text & Formatted Docs**: TXT, Markdown, HTML
- **Images**: PNG, JPG, JPEG (with OCR and bounding boxes)
- **Web Pages**: URLs (cleaned of boilerplate)
- **Direct Input**: Free-text prompt

## Architecture
- `api/`: REST routing (`POST /extract`, `GET /extract/{document_id}`) and schemas
- `processors/`: Specialized document converters and normalizers
- `models/`: Canonical Pydantic data contracts
- `services/`: Extraction orchestrator and storage services
- `utils/`: MIME detection, metadata generation, and source mapping
- `storage/`: Persisted JSON extraction artifacts

## Running the Service
```bash
python -m uvicorn extraction.main:app --reload --port 8000
```

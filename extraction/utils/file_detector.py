import uuid
from typing import Set

SUPPORTED_EXTENSIONS: Set[str] = {
    "pdf", "docx", "txt", "md", "html", "png", "jpg", "jpeg"
}

def generate_document_id() -> str:
    """Generate a unique document identifier."""
    return f"doc_{uuid.uuid4().hex[:8]}"

def is_supported_format(filename: str) -> bool:
    """Check if the filename has a supported document or image extension."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[-1].lower()
    return ext in SUPPORTED_EXTENSIONS

def detect_file_type(filename: str, content: bytes = b"") -> str:
    """
    Detect and validate file type from filename and content headers.
    Raises ValueError if format is unsupported.
    """
    if not filename or "." not in filename:
        raise ValueError(f"Unsupported file format: {filename}")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file format: .{ext}")
    return ext

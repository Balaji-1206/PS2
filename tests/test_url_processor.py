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

@pytest.mark.asyncio
async def test_invalid_url_raises_error():
    processor = UrlProcessor()
    with pytest.raises(ValueError, match="Invalid URL schema"):
        await processor.fetch_and_clean("not-a-url")

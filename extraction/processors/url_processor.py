from typing import Tuple
import httpx
from bs4 import BeautifulSoup

class UrlProcessor:
    """
    Fetches HTML from web URLs, removes non-content boilerplate
    (nav, footer, ads, scripts), and normalizes readable content into Markdown.
    """
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

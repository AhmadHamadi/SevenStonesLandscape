"""
Inline partials/header.html and partials/footer.html into every HTML page
that uses the placeholder divs. This makes navigation and internal links
visible to AI crawlers that do not execute JavaScript (GPTBot, ClaudeBot,
PerplexityBot, Applebot).
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

HEADER_MARK_START = "<!-- INLINED_HEADER_START -->"
HEADER_MARK_END = "<!-- INLINED_HEADER_END -->"
FOOTER_MARK_START = "<!-- INLINED_FOOTER_START -->"
FOOTER_MARK_END = "<!-- INLINED_FOOTER_END -->"

HEADER_PLACEHOLDER_RE = re.compile(
    r'<div id="header-placeholder"\s*></div>', re.IGNORECASE
)
FOOTER_PLACEHOLDER_RE = re.compile(
    r'<div id="footer-placeholder"\s*></div>', re.IGNORECASE
)

HEADER_BLOCK_RE = re.compile(
    re.escape(HEADER_MARK_START) + r".*?" + re.escape(HEADER_MARK_END),
    re.DOTALL,
)
FOOTER_BLOCK_RE = re.compile(
    re.escape(FOOTER_MARK_START) + r".*?" + re.escape(FOOTER_MARK_END),
    re.DOTALL,
)


def load(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def wrap(content: str, start: str, end: str) -> str:
    return f"{start}\n{content.strip()}\n{end}"


def inline_file(html_path: Path, header_html: str, footer_html: str) -> bool:
    text = load(html_path)
    original = text

    header_block = wrap(header_html, HEADER_MARK_START, HEADER_MARK_END)
    footer_block = wrap(footer_html, FOOTER_MARK_START, FOOTER_MARK_END)

    if HEADER_BLOCK_RE.search(text):
        text = HEADER_BLOCK_RE.sub(lambda _m: header_block, text, count=1)
    else:
        text, n = HEADER_PLACEHOLDER_RE.subn(header_block, text, count=1)
        if n == 0:
            return False

    if FOOTER_BLOCK_RE.search(text):
        text = FOOTER_BLOCK_RE.sub(lambda _m: footer_block, text, count=1)
    else:
        text, n = FOOTER_PLACEHOLDER_RE.subn(footer_block, text, count=1)
        if n == 0:
            print(f"  warning: {html_path} has header placeholder but no footer placeholder")

    if text != original:
        write(html_path, text)
        return True
    return False


def main() -> int:
    header_html = load(ROOT / "partials" / "header.html")
    footer_html = load(ROOT / "partials" / "footer.html")

    changed = 0
    scanned = 0
    for path in ROOT.rglob("*.html"):
        if "node_modules" in path.parts:
            continue
        if path.parts[-2:] == ("partials", "header.html") or path.parts[-2:] == ("partials", "footer.html"):
            continue
        if path.parent.name == "partials":
            continue
        scanned += 1
        try:
            if inline_file(path, header_html, footer_html):
                changed += 1
        except Exception as exc:
            print(f"  error: {path}: {exc}", file=sys.stderr)

    print(f"scanned {scanned} files; wrote changes to {changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

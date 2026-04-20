"""Audit meta descriptions length and BreadcrumbList presence across all HTML pages."""
from pathlib import Path
import re
import html

ROOT = Path(__file__).resolve().parent.parent
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', re.IGNORECASE)
BREADCRUMB_RE = re.compile(r'"@type"\s*:\s*"BreadcrumbList"', re.IGNORECASE)
TITLE_RE = re.compile(r'<title[^>]*>([^<]+)</title>', re.IGNORECASE)
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)


def display_len(raw: str) -> int:
    # HTML entities like &amp; count as 1 char when rendered
    return len(html.unescape(raw))


def main():
    over_desc = []
    missing_breadcrumb = []
    all_pages = []
    for html_file in ROOT.rglob("*.html"):
        s = str(html_file)
        if "node_modules" in s or "partials" in s or "scripts" in s:
            continue
        rel = html_file.relative_to(ROOT).as_posix()
        text = html_file.read_text(encoding="utf-8", errors="ignore")
        # Skip redirect stubs
        if NOINDEX_RE.search(text) or REFRESH_RE.search(text):
            continue
        all_pages.append(rel)

        m = DESC_RE.search(text)
        if m:
            raw = m.group(1)
            dlen = display_len(raw)
            if dlen > 170:
                over_desc.append((rel, dlen, raw))
        else:
            over_desc.append((rel, 0, "(no meta description)"))

        if not BREADCRUMB_RE.search(text):
            missing_breadcrumb.append(rel)

    print(f"=== META DESCRIPTIONS OVER 170 CHARS: {len(over_desc)} ===")
    for rel, dlen, raw in sorted(over_desc, key=lambda x: -x[1]):
        print(f"  {dlen:4d}  {rel}")
    print()
    print(f"=== PAGES MISSING BreadcrumbList: {len(missing_breadcrumb)} ===")
    for rel in sorted(missing_breadcrumb):
        print(f"  {rel}")
    print()
    print(f"TOTAL PAGES: {len(all_pages)}")


if __name__ == "__main__":
    main()

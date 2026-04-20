"""Dump current meta descriptions for pages over limit, in order."""
from pathlib import Path
import re
import html

ROOT = Path(__file__).resolve().parent.parent
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', re.IGNORECASE)
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)


def display_len(raw):
    return len(html.unescape(raw))


results = []
for html_file in ROOT.rglob("*.html"):
    s = str(html_file)
    if "node_modules" in s or "partials" in s or "scripts" in s:
        continue
    rel = html_file.relative_to(ROOT).as_posix()
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    if NOINDEX_RE.search(text) or REFRESH_RE.search(text):
        continue
    m = DESC_RE.search(text)
    if not m:
        continue
    raw = m.group(1)
    dlen = display_len(raw)
    if dlen > 170:
        results.append((dlen, rel, raw))

results.sort(key=lambda x: -x[0])
for dlen, rel, raw in results:
    print(f"--- [{dlen}] {rel}")
    print(raw)
    print()

"""Audit <img> tags for lazy-loading, decoding, and width/height."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
IMG_RE = re.compile(r'<img\s+([^>]*?)/?>', re.IGNORECASE | re.DOTALL)
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)


def has_attr(attrs_str, name):
    return re.search(rf'\b{re.escape(name)}\s*=', attrs_str, re.IGNORECASE) is not None


total = 0
no_lazy = 0
no_decoding = 0
no_dims = 0
no_alt = 0
first_image_per_page = {}

for html_file in ROOT.rglob("*.html"):
    s = str(html_file)
    if "node_modules" in s or "partials" in s or "scripts" in s:
        continue
    rel = html_file.relative_to(ROOT).as_posix()
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    if NOINDEX_RE.search(text) or REFRESH_RE.search(text):
        continue

    imgs = list(IMG_RE.finditer(text))
    for i, m in enumerate(imgs):
        attrs = m.group(1)
        total += 1
        is_first = (i == 0)
        if not has_attr(attrs, "loading") and not is_first:
            no_lazy += 1
        if not has_attr(attrs, "decoding"):
            no_decoding += 1
        if not has_attr(attrs, "width") or not has_attr(attrs, "height"):
            no_dims += 1
        if not has_attr(attrs, "alt"):
            no_alt += 1

print(f"Total <img> tags: {total}")
print(f"  Missing loading='lazy' (non-first): {no_lazy}")
print(f"  Missing decoding='async': {no_decoding}")
print(f"  Missing width/height: {no_dims}")
print(f"  Missing alt: {no_alt}")

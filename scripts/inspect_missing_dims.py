"""List <img> tags missing width/height and whether the src is a local file."""
from pathlib import Path
import re
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
IMG_RE = re.compile(r'<img\s+([^>]*?)/?>', re.IGNORECASE | re.DOTALL)
SRC_RE = re.compile(r'\bsrc\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)


def has_attr(attrs_str, name):
    return re.search(rf'\b{re.escape(name)}\s*=', attrs_str, re.IGNORECASE) is not None


src_counter = Counter()
ext_counter = Counter()
external = 0
local_exists = 0
local_missing = 0
for html_file in ROOT.rglob("*.html"):
    s = str(html_file)
    if "node_modules" in s or "partials" in s or "scripts" in s:
        continue
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    if NOINDEX_RE.search(text) or REFRESH_RE.search(text):
        continue
    for m in IMG_RE.finditer(text):
        attrs = m.group(1)
        if has_attr(attrs, "width") and has_attr(attrs, "height"):
            continue
        sm = SRC_RE.search(attrs)
        if not sm:
            continue
        src = sm.group(1)
        ext = src.split("?", 1)[0].split("#", 1)[0].rsplit(".", 1)[-1].lower()
        ext_counter[ext] += 1
        if src.startswith("http://") or src.startswith("https://"):
            external += 1
        else:
            src_counter[src] += 1
            local_path = ROOT / src.lstrip("/")
            if local_path.exists():
                local_exists += 1
            else:
                local_missing += 1

print("Extensions missing dims:")
for ext, n in ext_counter.most_common():
    print(f"  {ext}: {n}")
print(f"\nExternal (http): {external}")
print(f"Local files exist: {local_exists}")
print(f"Local files MISSING on disk: {local_missing}")
print(f"\nTop sources missing dims:")
for src, n in src_counter.most_common(20):
    print(f"  {n:3d}  {src}")

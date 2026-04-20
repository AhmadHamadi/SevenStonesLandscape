"""Find <img src> references to local files that do not exist on disk."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SRC_RE = re.compile(r'<img\s+[^>]*\bsrc\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)

missing = {}
for html_file in ROOT.rglob("*.html"):
    s = str(html_file)
    if "node_modules" in s or "partials" in s or "scripts" in s:
        continue
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    if NOINDEX_RE.search(text):
        continue
    for m in SRC_RE.finditer(text):
        src = m.group(1)
        if src.startswith("http://") or src.startswith("https://"):
            continue
        local = ROOT / src.lstrip("/")
        if not local.exists():
            missing.setdefault(src, []).append(html_file.relative_to(ROOT).as_posix())

for src, files in sorted(missing.items(), key=lambda x: -len(x[1])):
    print(f"{len(files):3d}x  {src}")
    for f in files[:3]:
        print(f"       {f}")
    if len(files) > 3:
        print(f"       ... and {len(files) - 3} more")

"""Validate all JSON-LD blocks parse correctly."""
from pathlib import Path
import re
import json

ROOT = Path(__file__).resolve().parent.parent
BLOCK_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.IGNORECASE | re.DOTALL,
)

errors = 0
total = 0
for html_file in ROOT.rglob("*.html"):
    s = str(html_file)
    if "node_modules" in s or "scripts" in s:
        continue
    rel = html_file.relative_to(ROOT).as_posix()
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    for i, m in enumerate(BLOCK_RE.finditer(text)):
        total += 1
        body = m.group(1).strip()
        try:
            json.loads(body)
        except Exception as e:
            errors += 1
            print(f"ERROR in {rel} block #{i+1}: {e}")
            print(f"  Preview: {body[:200]}")

print(f"\nParsed {total} JSON-LD blocks. Errors: {errors}")

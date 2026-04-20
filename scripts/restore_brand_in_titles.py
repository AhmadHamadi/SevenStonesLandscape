"""
Restore 'Seven Stones Landscape' (full brand) in all <title>, og:title, and
twitter:title tags that were shortened to 'Seven Stones' during SEO passes.

Matches the Google Business Profile brand and preserves the 'landscape' keyword
which is high-intent for SEO.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Target all HTML files except redirect shims and inlined partials.
EXTS = ("*.html",)
SKIP_DIRS = {"node_modules", ".git", "scripts", "partials"}


PATTERNS = [
    # <title>... | Seven Stones</title>
    (
        re.compile(r"\| Seven Stones</title>"),
        "| Seven Stones Landscape</title>",
    ),
    # og:title / twitter:title content="... | Seven Stones"
    (
        re.compile(r'\| Seven Stones"(\s*/?>)'),
        r'| Seven Stones Landscape"\1',
    ),
]


def should_skip(p: Path) -> bool:
    parts = set(p.parts)
    return bool(parts & SKIP_DIRS)


def process(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text
    for pattern, replacement in PATTERNS:
        text = pattern.sub(replacement, text)
    if text == original:
        return 0
    path.write_text(text, encoding="utf-8")
    return 1


def main() -> None:
    changed = 0
    total = 0
    for ext in EXTS:
        for path in ROOT.rglob(ext):
            if should_skip(path):
                continue
            total += 1
            changed += process(path)
    print(f"scanned {total} html files; updated {changed}")


if __name__ == "__main__":
    main()

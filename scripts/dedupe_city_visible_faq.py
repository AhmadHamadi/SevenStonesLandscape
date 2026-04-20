"""
Rewrite the VISIBLE FAQ HTML block on each city page with the unique, city-specific
Q&A content we already installed as JSON-LD via dedupe_city_faq.py.

Without this, the same templated answers ("Landscaping costs in X depend on project size...")
appear visible on all 9 city pages, which Google flags as duplicate content.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CITIES_DIR = ROOT / "service-areas"
SCRIPTS_DIR = ROOT / "scripts"

sys.path.insert(0, str(SCRIPTS_DIR))
from dedupe_city_faq import CITY_FAQ  # noqa: E402


# The visible block starts with `<div class="faq-list">` (multi-line, indented)
# and ends with `</div>\s*</div>` — the faq-list close then the faq-inner close.
# We capture the opening tag and closing delimiter so only the inner items change.
FAQ_VISIBLE_PATTERN = re.compile(
    r'(<div class="faq-list">)(.*?)(</div>\s*</div>\s*</div>\s*</section>)',
    re.DOTALL,
)


def build_faq_items(qa_pairs: list[tuple[str, str]]) -> str:
    parts = ["\n"]
    for q, a in qa_pairs:
        q_esc = html.escape(q)
        a_esc = html.escape(a)
        parts.append(
            f'          <div class="faq-item">\n'
            f'            <button type="button" class="faq-question" aria-expanded="false">{q_esc}</button>\n'
            f'            <div class="faq-answer"><div class="faq-answer-inner">{a_esc}</div></div>\n'
            f'          </div>\n'
        )
    parts.append("        ")
    return "".join(parts)


def main() -> None:
    changed = 0
    for slug, qa in CITY_FAQ.items():
        path = CITIES_DIR / slug / "index.html"
        if not path.exists():
            print(f"[skip] missing: {path}")
            continue
        text = path.read_text(encoding="utf-8")
        new_items = build_faq_items(qa)

        def repl(m: re.Match) -> str:
            return m.group(1) + new_items + m.group(3)

        new_text, count = FAQ_VISIBLE_PATTERN.subn(repl, text, count=1)
        if count == 0:
            print(f"[skip] visible FAQ pattern not found: {slug}")
            continue
        path.write_text(new_text, encoding="utf-8")
        changed += 1
        print(f"[ok] rewrote visible FAQ in {slug}")
    print(f"done; {changed} city pages updated")


if __name__ == "__main__":
    main()

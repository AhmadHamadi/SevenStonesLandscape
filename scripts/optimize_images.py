"""Add loading='lazy' (non-first) and decoding='async' (all) to <img> tags."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)
IMG_RE = re.compile(r'(<img\b)([^>]*?)(/?>)', re.IGNORECASE | re.DOTALL)


def has_attr(attrs_str, name):
    return re.search(rf'\b{re.escape(name)}\s*=', attrs_str, re.IGNORECASE) is not None


def process_file(text):
    # Split to run stateful replacement so we can track "first" img.
    parts = []
    last = 0
    idx = 0
    modified = False
    for m in IMG_RE.finditer(text):
        open_tag, attrs, close_tag = m.group(1), m.group(2), m.group(3)
        is_first = (idx == 0)
        additions = []
        if not has_attr(attrs, "decoding"):
            additions.append(' decoding="async"')
        if not is_first and not has_attr(attrs, "loading"):
            additions.append(' loading="lazy"')
        # Ensure LCP hero image has fetchpriority hint when first (only if missing)
        if is_first and not has_attr(attrs, "fetchpriority"):
            # Only add fetchpriority=high to the very first image of the page
            # to help LCP. Keep it conservative.
            additions.append(' fetchpriority="high"')
        if additions:
            modified = True
            # Make sure attrs ends with a space before closing (or add one)
            attrs_fixed = attrs.rstrip()
            new_tag = f"{open_tag}{attrs_fixed}{''.join(additions)} {close_tag.lstrip()}"
        else:
            new_tag = m.group(0)
        parts.append(text[last:m.start()])
        parts.append(new_tag)
        last = m.end()
        idx += 1
    parts.append(text[last:])
    return "".join(parts), modified


def main():
    changed_files = 0
    for html_file in ROOT.rglob("*.html"):
        s = str(html_file)
        if "node_modules" in s or "partials" in s or "scripts" in s:
            continue
        text = html_file.read_text(encoding="utf-8", errors="ignore")
        if NOINDEX_RE.search(text) or REFRESH_RE.search(text):
            continue
        new_text, modified = process_file(text)
        if modified:
            html_file.write_text(new_text, encoding="utf-8")
            changed_files += 1
    print(f"Changed {changed_files} files")


if __name__ == "__main__":
    main()

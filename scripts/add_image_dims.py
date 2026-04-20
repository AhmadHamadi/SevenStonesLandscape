"""Probe actual pixel dimensions of local images and add width/height to <img> tags that lack them."""
from pathlib import Path
import re
import struct

ROOT = Path(__file__).resolve().parent.parent
IMG_RE = re.compile(r'(<img\b)([^>]*?)(/?>)', re.IGNORECASE | re.DOTALL)
SRC_RE = re.compile(r'\bsrc\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
NOINDEX_RE = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.IGNORECASE)
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)


def has_attr(attrs_str, name):
    return re.search(rf'\b{re.escape(name)}\s*=', attrs_str, re.IGNORECASE) is not None


def probe_png(path):
    with open(path, "rb") as f:
        sig = f.read(8)
        if sig[:8] != b"\x89PNG\r\n\x1a\n":
            return None
        f.read(4)  # length
        f.read(4)  # IHDR
        w, h = struct.unpack(">II", f.read(8))
        return w, h


def probe_jpeg(path):
    """Parse JPEG to extract image dimensions from SOF markers."""
    try:
        with open(path, "rb") as f:
            if f.read(2) != b"\xff\xd8":
                return None
            while True:
                # scan for marker 0xFF
                b = f.read(1)
                if not b:
                    return None
                if b != b"\xff":
                    continue
                # consume fill bytes
                while True:
                    b = f.read(1)
                    if not b:
                        return None
                    if b != b"\xff":
                        marker = b[0]
                        break
                # SOF markers: 0xC0-0xCF except 0xC4, 0xC8, 0xCC
                if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                    seg_len = struct.unpack(">H", f.read(2))[0]
                    f.read(1)  # precision
                    h, w = struct.unpack(">HH", f.read(4))
                    return w, h
                elif marker in (0xD8, 0xD9):
                    return None
                elif marker in (0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7):
                    continue
                else:
                    # skip segment
                    b2 = f.read(2)
                    if len(b2) < 2:
                        return None
                    seg_len = struct.unpack(">H", b2)[0]
                    f.read(seg_len - 2)
    except Exception:
        return None


def probe(path):
    ext = path.suffix.lower()
    if ext == ".png":
        return probe_png(path)
    elif ext in (".jpg", ".jpeg"):
        return probe_jpeg(path)
    return None


# Cache dims per src so we don't re-probe
DIMS = {}


def get_dims(src):
    if src.startswith("http://") or src.startswith("https://"):
        return None
    if src in DIMS:
        return DIMS[src]
    local = ROOT / src.lstrip("/")
    if not local.exists():
        DIMS[src] = None
        return None
    dims = probe(local)
    DIMS[src] = dims
    return dims


def main():
    updated_tags = 0
    changed_files = 0
    for html_file in ROOT.rglob("*.html"):
        s = str(html_file)
        if "node_modules" in s or "partials" in s or "scripts" in s:
            continue
        text = html_file.read_text(encoding="utf-8", errors="ignore")
        if NOINDEX_RE.search(text) or REFRESH_RE.search(text):
            continue
        parts = []
        last = 0
        modified = False
        for m in IMG_RE.finditer(text):
            open_tag, attrs, close_tag = m.group(1), m.group(2), m.group(3)
            if has_attr(attrs, "width") and has_attr(attrs, "height"):
                parts.append(text[last:m.end()])
                last = m.end()
                continue
            sm = SRC_RE.search(attrs)
            if not sm:
                parts.append(text[last:m.end()])
                last = m.end()
                continue
            src = sm.group(1)
            dims = get_dims(src)
            if not dims:
                parts.append(text[last:m.end()])
                last = m.end()
                continue
            w, h = dims
            additions = []
            if not has_attr(attrs, "width"):
                additions.append(f' width="{w}"')
            if not has_attr(attrs, "height"):
                additions.append(f' height="{h}"')
            new_attrs = attrs.rstrip() + "".join(additions) + " "
            new_tag = f"{open_tag}{new_attrs}{close_tag.lstrip()}"
            parts.append(text[last:m.start()])
            parts.append(new_tag)
            last = m.end()
            modified = True
            updated_tags += 1
        parts.append(text[last:])
        if modified:
            html_file.write_text("".join(parts), encoding="utf-8")
            changed_files += 1
    print(f"Updated {updated_tags} img tags across {changed_files} files")


if __name__ == "__main__":
    main()

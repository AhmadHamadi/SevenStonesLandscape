"""Inject BreadcrumbList JSON-LD into pages that lack it."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://www.sevenstoneslandscape.ca"

BREADCRUMBS = {
    "faq/index.html": [("Home", "/"), ("FAQ", "/faq/")],
    "privacy/index.html": [("Home", "/"), ("Privacy Policy", "/privacy/")],
    "sitemap/index.html": [("Home", "/"), ("Sitemap", "/sitemap/")],
    "terms-of-service/index.html": [("Home", "/"), ("Terms of Service", "/terms-of-service/")],
    "solutions/index.html": [("Home", "/"), ("Solutions", "/solutions/")],
    "solutions/curb-appeal-roi/index.html": [
        ("Home", "/"), ("Solutions", "/solutions/"), ("Curb Appeal ROI", "/solutions/curb-appeal-roi/"),
    ],
    "solutions/flagstone-mastery-guide/index.html": [
        ("Home", "/"), ("Solutions", "/solutions/"), ("Flagstone Mastery Guide", "/solutions/flagstone-mastery-guide/"),
    ],
    "solutions/flood-proof-your-property/index.html": [
        ("Home", "/"), ("Solutions", "/solutions/"), ("Flood-Proof Your Property", "/solutions/flood-proof-your-property/"),
    ],
    "solutions/interlock-repair-hamilton/index.html": [
        ("Home", "/"), ("Solutions", "/solutions/"), ("Interlock Repair Hamilton", "/solutions/interlock-repair-hamilton/"),
    ],
    "solutions/sinking-steps-repair/index.html": [
        ("Home", "/"), ("Solutions", "/solutions/"), ("Sinking Steps Repair", "/solutions/sinking-steps-repair/"),
    ],
    "solutions/yard-drainage-ontario/index.html": [
        ("Home", "/"), ("Solutions", "/solutions/"), ("Yard Drainage Ontario", "/solutions/yard-drainage-ontario/"),
    ],
    "service-areas/burlington/interlock-driveways/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Burlington", "/service-areas/burlington/"),
        ("Interlock Driveways", "/service-areas/burlington/interlock-driveways/"),
    ],
    "service-areas/burlington/retaining-walls/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Burlington", "/service-areas/burlington/"),
        ("Retaining Walls", "/service-areas/burlington/retaining-walls/"),
    ],
    "service-areas/dundas/yard-grading-drainage/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Dundas", "/service-areas/dundas/"),
        ("Yard Grading & Drainage", "/service-areas/dundas/yard-grading-drainage/"),
    ],
    "service-areas/hamilton/concrete-steps/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Hamilton", "/service-areas/hamilton/"),
        ("Concrete Steps", "/service-areas/hamilton/concrete-steps/"),
    ],
    "service-areas/hamilton/interlock-driveways/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Hamilton", "/service-areas/hamilton/"),
        ("Interlock Driveways", "/service-areas/hamilton/interlock-driveways/"),
    ],
    "service-areas/hamilton/patio-contractors/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Hamilton", "/service-areas/hamilton/"),
        ("Patio Contractors", "/service-areas/hamilton/patio-contractors/"),
    ],
    "service-areas/hamilton/retaining-walls/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Hamilton", "/service-areas/hamilton/"),
        ("Retaining Walls", "/service-areas/hamilton/retaining-walls/"),
    ],
    "service-areas/milton/flagstone-installation/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Milton", "/service-areas/milton/"),
        ("Flagstone Installation", "/service-areas/milton/flagstone-installation/"),
    ],
    "service-areas/milton/retaining-walls/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Milton", "/service-areas/milton/"),
        ("Retaining Walls", "/service-areas/milton/retaining-walls/"),
    ],
    "service-areas/milton/stone-walkway-installation/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Milton", "/service-areas/milton/"),
        ("Stone Walkway Installation", "/service-areas/milton/stone-walkway-installation/"),
    ],
    "service-areas/oakville/retaining-walls/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Oakville", "/service-areas/oakville/"),
        ("Retaining Walls", "/service-areas/oakville/retaining-walls/"),
    ],
    "service-areas/waterdown/patio-installation/index.html": [
        ("Home", "/"), ("Service Areas", "/service-areas/"),
        ("Waterdown", "/service-areas/waterdown/"),
        ("Patio Installation", "/service-areas/waterdown/patio-installation/"),
    ],
}


def make_json_ld(items):
    element_list = [
        {"@type": "ListItem", "position": i + 1, "name": name, "item": f"{BASE}{path}"}
        for i, (name, path) in enumerate(items)
    ]
    data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": element_list}
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def main():
    added = 0
    skipped = 0
    for rel, crumbs in BREADCRUMBS.items():
        path = ROOT / rel
        if not path.exists():
            print(f"MISSING: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        if "BreadcrumbList" in text:
            print(f"SKIP (has it): {rel}")
            skipped += 1
            continue
        json_ld = make_json_ld(crumbs)
        block = f'  <script type="application/ld+json">\n  {json_ld}\n  </script>\n</head>'
        if "</head>" not in text:
            print(f"NO </head>: {rel}")
            continue
        new_text = text.replace("</head>", block, 1)
        path.write_text(new_text, encoding="utf-8")
        added += 1
        print(f"ADDED ({len(crumbs)} items): {rel}")
    print(f"\nAdded {added}, skipped {skipped}")


if __name__ == "__main__":
    main()

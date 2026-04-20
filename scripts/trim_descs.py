"""Apply shortened meta descriptions across the site.

For each (file, old, new) entry:
  - Replace every occurrence of `old` inside meta description, og:description, twitter:description
    attributes in the target HTML file.
Uses exact-string replacement on the content=" ... " value.
"""
from pathlib import Path
import re
import html as _html

ROOT = Path(__file__).resolve().parent.parent

# Each entry: relative path -> (OLD raw content attr value, NEW raw content attr value)
REPLACEMENTS = {
    "service-areas/oakville/index.html": (
        "Top-rated Oakville landscape &amp; interlock contractor serving Old Oakville, Eastlake, Glen Abbey, Bronte, Joshua Creek, Iroquois Ridge &amp; all Oakville. Premium interlock patios, concrete driveways, retaining walls, pool surrounds, sod, estate landscape design. ICPI certified, Unilock &amp; Techo-Bloc installer. Free quote.",
        "ICPI-certified Oakville landscape &amp; interlock contractor. Patios, driveways, retaining walls, pool surrounds, sod. Unilock &amp; Techo-Bloc installer. Free quote.",
    ),
    "service-areas/burlington/index.html": (
        "Top-rated Burlington landscape &amp; interlock contractor. Serving Roseland, Shoreacres, Aldershot, Tyandaga, Millcroft, Alton Village &amp; all Burlington neighbourhoods. Interlock patios, concrete driveways, retaining walls, pool surrounds, sod, drainage. ICPI certified, Unilock &amp; Techo-Bloc installer. Free quote.",
        "ICPI-certified Burlington landscape &amp; interlock contractor. Patios, driveways, walls, pool surrounds, sod, drainage. Unilock &amp; Techo-Bloc installer. Free quote.",
    ),
    "service-areas/hamilton/index.html": (
        "Top-rated Hamilton landscape &amp; interlock contractor. Interlock patios, concrete driveways, retaining walls, sod, yard grading, drainage correction. Serving Westdale, Ancaster, Dundas, Stoney Creek, Waterdown &amp; Hamilton Mountain. ICPI certified, Unilock &amp; Techo-Bloc installer. Free quote.",
        "ICPI-certified Hamilton landscape &amp; interlock contractor. Patios, driveways, retaining walls, sod, yard grading. Unilock &amp; Techo-Bloc installer. Est. 2013.",
    ),
    "services/concrete/index.html": (
        "Residential concrete contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Concrete driveways, stamped patios, exposed aggregate, decorative concrete steps &amp; walkways. Proper frost-depth footings, rebar reinforcement, freeze-thaw sealers. Est. 2013. Free on-site quote.",
        "Concrete contractor in Hamilton, Burlington, Oakville &amp; Milton. Driveways, stamped patios, exposed aggregate, steps, walkways. Est. 2013. Free on-site quote.",
    ),
    "services/retaining-walls/index.html": (
        "Engineered retaining walls in Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Allan Block, Unilock Pisa2, Techo-Bloc Mini-Creta, and armour stone walls with proper drainage chimneys, geogrid reinforcement and permit drawings. ICPI certified since 2013. Free on-site quote.",
        "Engineered retaining walls in Hamilton, Burlington &amp; Oakville. Allan Block, Unilock Pisa2, Techo-Bloc, armour stone. ICPI certified. Free on-site quote.",
    ),
    "services/interlock-patios/index.html": (
        "ICPI-certified interlock patio &amp; driveway contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Authorized Unilock &amp; Techo-Bloc installer since 2013. 8-inch compacted base, polymeric joint sand, 5-year workmanship warranty. Free on-site interlock quote.",
        "ICPI-certified interlock patio &amp; driveway contractor in Hamilton, Burlington, Oakville &amp; Milton. Authorized Unilock &amp; Techo-Bloc installer. 5-year warranty.",
    ),
    "service-areas/mississauga/index.html": (
        "Landscape contractor in Mississauga \u2014 Lorne Park, Mineola, Port Credit, Clarkson, Erin Mills, Streetsville. Interlock driveways, patios, retaining walls, pool surrounds. CVC permit experienced. ICPI certified, Unilock &amp; Techo-Bloc installer. Est. 2013.",
        "Landscape contractor in Mississauga: Lorne Park, Port Credit, Clarkson, Erin Mills. Interlock driveways, patios, retaining walls. ICPI certified. Est. 2013.",
    ),
    "service-areas/stoney-creek/index.html": (
        "Landscape contractor serving Stoney Creek lakefront, Mountain, Village, Winona and Fifty Point. Interlock driveways, patios, retaining walls, pool surrounds, drainage. ICPI certified, Unilock &amp; Techo-Bloc installer. Since 2013. Free on-site quote.",
        "Landscape contractor in Stoney Creek: lakefront, Mountain, Winona, Fifty Point. Interlock driveways, patios, walls, drainage. ICPI certified. Est. 2013.",
    ),
    "service-areas/waterdown/index.html": (
        "Landscape contractor in Waterdown \u2014 Academy, Summit Park, Cranston, Mountain Brow estates. Interlock driveways, patios, retaining walls, drainage. Conservation Halton permit experienced. ICPI certified, Unilock &amp; Techo-Bloc installer. Since 2013.",
        "Landscape contractor in Waterdown: Academy, Summit Park, Cranston &amp; Mountain Brow. Interlock, patios, retaining walls, drainage. ICPI certified. Est. 2013.",
    ),
    "service-areas/hamilton/retaining-walls/index.html": (
        "ICPI certified Hamilton retaining wall contractor serving Mountain brow, Ancaster Heights, Meadowlands, Stoney Creek &amp; Dundas. NEC-approved engineered walls, geogrid reinforcement, Unilock Pisa2 &amp; Allan Block. Free on-site quote. Est. 2013.",
        "ICPI-certified Hamilton retaining wall contractor. Engineered walls, geogrid, Unilock Pisa2 &amp; Allan Block. NEC-compliant. Free on-site quote. Est. 2013.",
    ),
    "service-areas/hamilton/interlock-driveways/index.html": (
        "ICPI certified Hamilton interlock driveway contractor serving Westdale, Kirkendall, Ainslie Wood, Durand, Hamilton Mountain, Stoney Creek &amp; Ancaster. Unilock &amp; Techo-Bloc installer. 8-inch base on clay. Free online estimate. Est. 2013.",
        "ICPI-certified Hamilton interlock driveway contractor. Unilock &amp; Techo-Bloc installer. 8-inch clay-soil base. Free online estimate. Est. 2013.",
    ),
    "service-areas/oakville/retaining-walls/index.html": (
        "ICPI certified Oakville retaining wall contractor serving Old Oakville, Eastlake, Glen Abbey, Bronte Creek, Joshua Creek &amp; Iroquois Ridge. Conservation Halton permitted, engineered walls, armour stone. Free on-site quote. Est. 2013.",
        "ICPI-certified Oakville retaining wall contractor. Engineered walls, armour stone, Allan Block. Conservation Halton permits. Free on-site quote. Est. 2013.",
    ),
    "service-areas/dundas/index.html": (
        "Landscape contractor for Dundas heritage and Escarpment properties \u2014 University Gardens, Pleasant Valley, Dundana. Flagstone, natural stone, retaining walls, drainage. Heritage &amp; NEC permit experienced. ICPI certified. Est. 2013.",
        "Landscape contractor for Dundas heritage &amp; Escarpment homes: University Gardens, Pleasant Valley, Dundana. Flagstone, stone, walls. NEC experienced. Est. 2013.",
    ),
    "service-areas/milton/index.html": (
        "ICPI-certified landscape contractor in Milton \u2014 Scott, Boyne, Willmott, Ford, Campbellville. Interlock driveways, patios, retaining walls, drainage correction for clay subdivision lots. Unilock &amp; Techo-Bloc installer. Est. 2013.",
        "ICPI-certified landscape contractor in Milton: Scott, Boyne, Willmott, Campbellville. Clay-lot interlock, walls, drainage. Unilock authorized. Est. 2013.",
    ),
    "service-areas/ancaster/index.html": (
        "ICPI-certified landscape contractor in Ancaster \u2014 Heights, Meadowlands, Village, Sulphur Springs. Interlock driveways, patios, retaining walls, drainage. Unilock &amp; Techo-Bloc authorized installer. Est. 2013. Free on-site quote.",
        "ICPI-certified landscape contractor in Ancaster: Heights, Meadowlands, Village, Sulphur Springs. Interlock, walls, drainage. Unilock authorized. Est. 2013.",
    ),
    "service-areas/burlington/interlock-driveways/index.html": (
        "ICPI certified Burlington interlock driveway contractor serving Roseland, Shoreacres, Aldershot, Tyandaga, Millcroft, Alton Village &amp; Headon Forest. Authorized Unilock &amp; Techo-Bloc installer. Free online estimate. Est. 2013.",
        "ICPI-certified Burlington interlock driveway contractor. Authorized Unilock &amp; Techo-Bloc installer. Free online estimate. Est. 2013. 5-year warranty.",
    ),
    "service-areas/burlington/retaining-walls/index.html": (
        "ICPI certified Burlington retaining wall contractor serving Roseland, Shoreacres, Aldershot, Tyandaga, Mount Nemo &amp; Kerns Road. NEC-approved engineered walls, Allan Block, armour stone. Free on-site quote. Est. 2013.",
        "ICPI-certified Burlington retaining wall contractor. Engineered walls, Allan Block, armour stone. NEC-compliant where required. Free on-site quote. Est. 2013.",
    ),
    "service-areas/hamilton/patio-contractors/index.html": (
        "ICPI certified Hamilton patio contractor covering Westdale, Ainslie Wood, Durand, Hamilton Mountain, Ancaster &amp; Stoney Creek. Unilock &amp; Techo-Bloc patios with 6-inch clay-soil base. Free on-site quote. Est. 2013.",
        "ICPI-certified Hamilton patio contractor. Unilock &amp; Techo-Bloc interlock patios on engineered 6-inch clay-soil base. Free on-site quote. Est. 2013.",
    ),
    "service-areas/hamilton/concrete-steps/index.html": (
        "ICPI certified Hamilton concrete step contractor serving Westdale, Kirkendall, Durand, Corktown, Hamilton Mountain &amp; Stoney Creek. OBC-compliant rise/run, frost-footing rebuilds. Free online estimate. Est. 2013.",
        "ICPI-certified Hamilton concrete step contractor. OBC 9.8 rise/run, frost-footing rebuilds, epoxy dowels. Free online estimate. Est. 2013. $5M liability.",
    ),
    "services/sod-installation/index.html": (
        "Sod installation contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Kentucky bluegrass, Zander Sod &amp; Greenhorizons turf. Full grading, 4-inch triple-mix topsoil. Free on-site quote. Est. 2013.",
        "Sod installation contractor in Hamilton, Burlington, Oakville &amp; Milton. Kentucky bluegrass over 4-inch triple-mix topsoil. Full grading prep. Est. 2013.",
    ),
    "services/walkways/index.html": (
        "ICPI-certified walkway contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Interlock, Wiarton flagstone, Indiana limestone. Unilock &amp; Techo-Bloc installer. Free online estimate. Est. 2013.",
        "ICPI-certified walkway contractor in Hamilton, Burlington, Oakville &amp; Milton. Interlock, Wiarton flagstone, Indiana limestone. Unilock installer. Est. 2013.",
    ),
    "services/landscape-stone/index.html": (
        "Landscape stone contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Armour stone, river rock, Wiarton flagstone, 3/4-clear stone. Landscape Ontario member. Free on-site quote. Est. 2013.",
        "Landscape stone supplier &amp; installer in Hamilton, Burlington, Oakville &amp; Milton. Armour stone, river rock, Wiarton flagstone, 3/4-clear stone. Est. 2013.",
    ),
    "services/concrete/exposed-aggregate/index.html": (
        "Exposed aggregate concrete contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Slip-resistant driveways, walkways &amp; pool decks. 4000 PSI air-entrained. Free on-site quote. Est. 2013.",
        "Exposed aggregate concrete contractor in Hamilton, Burlington, Oakville &amp; Milton. Slip-resistant driveways, walkways, pool decks. 4000 PSI mix. Est. 2013.",
    ),
    "services/concrete/stamped-patios/index.html": (
        "Stamped concrete patio contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Ashlar slate, flagstone, seamless slate patterns. 4000 PSI air-entrained. Free on-site quote. Est. 2013.",
        "Stamped concrete patio contractor in Hamilton, Burlington, Oakville &amp; Milton. Ashlar slate, flagstone, seamless slate. 4000 PSI air-entrained mix. Est. 2013.",
    ),
    "service-areas/waterdown/patio-installation/index.html": (
        "ICPI-certified patio installation in Waterdown. Unilock, Techo-Bloc interlock &amp; stamped concrete across Parkside, Memorial, East Waterdown, Smokey Hollow. Est. 2013, $5M liability. (289) 700-0312.",
        "ICPI-certified patio installation in Waterdown. Unilock &amp; Techo-Bloc interlock plus stamped concrete. Est. 2013, $5M liability. Call (289) 700-0312.",
    ),
    "service-areas/index.html": (
        "ICPI certified, Unilock &amp; Techo-Bloc authorized installer serving Hamilton, Burlington, Oakville, Ancaster, Dundas, Waterdown, Stoney Creek, Milton &amp; Mississauga. Free online estimate. Est. 2013.",
        "ICPI-certified, Unilock &amp; Techo-Bloc installer serving Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Free online estimate. Est. 2013.",
    ),
    "service-areas/milton/stone-walkway-installation/index.html": (
        "ICPI-certified stone walkway installation in Milton. Flagstone &amp; Unilock walkways across Beaty, Harrison, Timberlea, Campbellville. Frost-resistant base. Est. 2013, $5M liability. (289) 700-0312.",
        "ICPI-certified stone walkway installation in Milton. Flagstone &amp; Unilock walkways. Frost-resistant base. Est. 2013, $5M liability. Call (289) 700-0312.",
    ),
    "service-areas/milton/flagstone-installation/index.html": (
        "ICPI-certified flagstone installation in Milton. Wiarton limestone, Credit Valley, random irregular patios across Beaty, Harrison, Willmott, Scott. Est. 2013, $5M liability. Call (289) 700-0312.",
        "ICPI-certified flagstone installation in Milton. Wiarton limestone, Credit Valley, random irregular patios. Est. 2013, $5M liability. Call (289) 700-0312.",
    ),
    "services/front-yard-landscaping/index.html": (
        "Front yard landscaping for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Interlock walkways, flagstone steps, planting beds, armour stone. ICPI-certified. Free on-site quote. Est. 2013.",
        "Front yard landscaping in Hamilton, Burlington, Oakville &amp; Milton. Interlock walkways, flagstone steps, planting beds, armour stone. ICPI certified. Est. 2013.",
    ),
    "services/yard-grading/index.html": (
        "Yard grading &amp; drainage contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. French drains, swales, 2% OBC-compliant slope, clay-soil specialists. Free on-site quote. Est. 2013.",
        "Yard grading &amp; drainage contractor in Hamilton, Burlington, Oakville &amp; Milton. French drains, swales, 2% OBC slope, clay-soil specialists. Est. 2013.",
    ),
    "services/index.html": (
        "ICPI-certified landscape &amp; hardscape contractor in Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Interlock patios, concrete driveways, retaining walls, sod, pool surrounds. Free quote.",
        "ICPI-certified landscape &amp; hardscape contractor in Hamilton, Burlington, Oakville &amp; Milton. Interlock, concrete, walls, sod, pool surrounds. Free quote.",
    ),
    "services/concrete/driveways/index.html": (
        "Concrete driveway contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. 5-inch 4000 PSI air-entrained pour, 6-inch 3/4-clear base, saw-cut joints. Free on-site quote. Est. 2013.",
        "Concrete driveway contractor in Hamilton, Burlington, Oakville &amp; Milton. 5-inch 4000 PSI air-entrained, 6-inch base, saw-cut joints. Est. 2013.",
    ),
    "services/concrete/steps-walkways/index.html": (
        "Concrete steps &amp; walkways contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. OBC-compliant 7-inch rise, 11-inch tread, 4000 PSI air-entrained. Free on-site quote. Est. 2013.",
        "Concrete steps &amp; walkways contractor in Hamilton, Burlington, Oakville &amp; Milton. OBC 7-inch rise, 11-inch tread, 4000 PSI mix. Est. 2013.",
    ),
    "service-areas/milton/retaining-walls/index.html": (
        "ICPI-certified retaining wall contractor in Milton. Armour stone, Unilock, Techo-Bloc, Allan Block across Beaty, Harrison, Scott, Campbellville. Est. 2013, $5M liability. Call (289) 700-0312.",
        "ICPI-certified retaining wall contractor in Milton. Armour stone, Unilock, Techo-Bloc &amp; Allan Block. Est. 2013, $5M liability. (289) 700-0312.",
    ),
    "index.html": (
        "ICPI-certified landscape &amp; interlock contractor in Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Unilock &amp; Techo-Bloc installer. Patios, driveways, walls, sod. Est. 2013. Free quote.",
        "ICPI-certified landscape &amp; interlock contractor in Hamilton, Burlington, Oakville &amp; Milton. Unilock &amp; Techo-Bloc installer. Est. 2013. Free quote.",
    ),
    "services/backyard-landscaping/index.html": (
        "Backyard landscaping design-build contractor for Hamilton, Burlington, Oakville, Milton &amp; Mississauga. Patios, fire pits, pergolas, sod, Unilock &amp; Techo-Bloc. Free on-site quote. Est. 2013.",
        "Backyard landscaping design-build in Hamilton, Burlington, Oakville &amp; Milton. Patios, fire pits, pergolas, sod. Unilock &amp; Techo-Bloc. Est. 2013.",
    ),
    "blog/unilock-vs-techo-bloc-ontario/index.html": (
        "A practical 2026 comparison of Unilock and Techo-Bloc pavers for Ontario driveways, patios, and pool surrounds: thickness, colour ranges, warranties, repairability, and real installed cost.",
        "Unilock vs Techo-Bloc for Ontario driveways, patios &amp; pool surrounds: thickness, colour ranges, warranties, repairability, and real installed cost.",
    ),
    "faq/index.html": (
        "Get answers to the most searched landscaping questions in Ontario: pricing, patios, retaining walls, sod, drainage, permits, and project timelines for Hamilton, Burlington, and Oakville.",
        "Ontario landscaping FAQ: pricing, patios, walls, sod, drainage, permits &amp; project timelines for Hamilton, Burlington, Oakville, Milton &amp; Mississauga.",
    ),
    "solutions/index.html": (
        "Solutions for patio sinking, drainage, retaining wall failure, uneven interlock, yellow sod &amp; more across Hamilton, Burlington, Oakville. ICPI certified, Est. 2013. Free online estimate.",
        "Fix patio sinking, yard drainage, retaining wall failure, uneven interlock &amp; yellow sod in Hamilton, Burlington, Oakville &amp; Milton. ICPI certified.",
    ),
    "solutions/sinking-steps-repair/index.html": (
        "Sinking steps repair in Hamilton, Burlington, Oakville. Fix settled concrete &amp; stone steps, restore safety &amp; curb appeal. ICPI certified, $5M liability, Est. 2013. Free online estimate.",
        "Sinking steps repair in Hamilton, Burlington, Oakville &amp; Milton. Fix settled concrete &amp; stone steps. ICPI certified, $5M liability, Est. 2013.",
    ),
    "solutions/interlock-repair-hamilton/index.html": (
        "Interlock repair Hamilton: fix shifting pavers, weeds, settled driveways &amp; patios. ICPI certified Unilock installer, $5M liability, Est. 2013. Free online estimate, 24-hour response.",
        "Interlock repair in Hamilton: fix shifting pavers, weeds &amp; settled driveways. ICPI certified Unilock installer. Est. 2013. Free online estimate.",
    ),
    "services/pools-and-pool-surrounds/index.html": (
        "ICPI-certified pool surrounds in Hamilton, Burlington &amp; Oakville. Unilock/Techo-Bloc coping, travertine, slip-resistant pavers, OBC-compliant drainage. Est. 2013. Free on-site quote.",
        "ICPI-certified pool surrounds in Hamilton, Burlington &amp; Oakville. Unilock &amp; Techo-Bloc coping, travertine, slip-resistant pavers. Est. 2013.",
    ),
    "solutions/backyard-drainage/index.html": (
        "Backyard drainage repair in Hamilton, Burlington, Oakville. Fix pooling, soggy lawns &amp; French drains on clay soil. ICPI certified, Est. 2013. Free online estimate, 24-hour response.",
        "Backyard drainage repair in Hamilton, Burlington, Oakville &amp; Milton. Fix pooling, soggy lawns &amp; French drains on clay soil. ICPI certified. Est. 2013.",
    ),
    "solutions/yard-drainage-ontario/index.html": (
        "Yard drainage in Hamilton, Burlington, Oakville. Fix backyard flooding, clay soils &amp; OBC 2% slope. ICPI certified, $5M liability, Est. 2013. Free online estimate, 24-hour response.",
        "Yard drainage in Hamilton, Burlington, Oakville &amp; Milton. Fix backyard flooding, clay soils &amp; OBC 2% slope. ICPI certified, $5M liability, Est. 2013.",
    ),
    "solutions/flood-proof-your-property/index.html": (
        "Flood-proof Hamilton, Burlington, Oakville homes with permeable pavers, regrading &amp; drainage. ICPI certified, Unilock installer, Est. 2013. Free online estimate, 24-hour response.",
        "Flood-proof Hamilton, Burlington, Oakville &amp; Milton homes with permeable pavers, regrading &amp; drainage. ICPI certified Unilock installer. Est. 2013.",
    ),
    "services/benches-and-fire-pits/index.html": (
        "Custom stone benches, seating walls &amp; gas/wood fire pits in Hamilton, Burlington &amp; Oakville. Unilock/Techo-Bloc kits, OBC clearances. Est. 2013. $5M liability. Free on-site quote.",
        "Custom stone benches, seating walls &amp; gas/wood fire pits in Hamilton, Burlington &amp; Oakville. Unilock/Techo-Bloc kits. Est. 2013. $5M liability.",
    ),
    "services/fences-and-staining/index.html": (
        "Cedar, PT &amp; composite fence installation &amp; pro staining in Hamilton, Burlington &amp; Oakville. 4-ft frost-line posts, by-law compliant. Est. 2013. $5M liability. Free on-site quote.",
        "Cedar, PT &amp; composite fence installation plus pro staining in Hamilton, Burlington &amp; Oakville. 4-ft frost-line posts, by-law compliant. Est. 2013.",
    ),
    "solutions/flagstone-mastery-guide/index.html": (
        "Natural flagstone patios &amp; walkways in Hamilton, Burlington, Oakville. Wiarton, sandstone &amp; limestone experts. ICPI certified, Est. 2013. Free online estimate, 24-hour response.",
        "Natural flagstone patios &amp; walkways in Hamilton, Burlington, Oakville &amp; Milton. Wiarton, sandstone &amp; limestone experts. ICPI certified. Est. 2013.",
    ),
    "solutions/lawn-drainage-problems/index.html": (
        "Lawn drainage fixes across Hamilton, Burlington, Oakville. Aeration, French drains &amp; regrading for clay soils. ICPI certified, Est. 2013. Free online estimate, 24-hour response.",
        "Lawn drainage fixes in Hamilton, Burlington, Oakville &amp; Milton. Aeration, French drains &amp; regrading for clay soils. ICPI certified. Est. 2013.",
    ),
    "solutions/patio-sinking/index.html": (
        "Patio sinking repair across Hamilton, Burlington, Oakville. Lift-and-relay specialists, ICPI certified. Diagnose base failure, fix drainage, restore level. Free online estimate.",
        "Patio sinking repair in Hamilton, Burlington, Oakville &amp; Milton. Lift-and-relay specialists, ICPI certified. Diagnose base failure, fix drainage.",
    ),
    "solutions/sod-turning-yellow/index.html": (
        "Fix yellow sod in Hamilton, Burlington, Oakville. Diagnose watering, drainage &amp; fungal issues. Kentucky Bluegrass specialists, Est. 2013. Free online estimate, 24-hour response.",
        "Fix yellow sod in Hamilton, Burlington, Oakville &amp; Milton. Diagnose watering, drainage &amp; fungal issues. Kentucky Bluegrass specialists. Est. 2013.",
    ),
    "solutions/yard-grading-drainage/index.html": (
        "Yard grading &amp; drainage across Hamilton, Burlington, Oakville. OBC 2% slope compliance, swales, French drains. ICPI certified, Est. 2013. Free online estimate, 24-hour response.",
        "Yard grading &amp; drainage in Hamilton, Burlington, Oakville &amp; Milton. OBC 2% slope, swales, French drains. ICPI certified, Est. 2013.",
    ),
    "blog/salt-damage-concrete-driveways-ontario/index.html": (
        "Why road salt scales and spalls concrete driveways in Ontario, how to prevent it, which sealers and salt alternatives work, and when a damaged slab can be repaired vs replaced.",
        "Why road salt scales Ontario concrete driveways, how to prevent it, which sealers and salt alternatives work, and when to repair vs replace.",
    ),
    "solutions/water-pooling-yard/index.html": (
        "Stop water pooling in Hamilton, Burlington, Oakville yards. Swales, dry wells &amp; French drains for clay soil. ICPI certified, Est. 2013. Free online estimate, 24-hour response.",
        "Stop water pooling in Hamilton, Burlington, Oakville &amp; Milton yards. Swales, dry wells &amp; French drains for clay soil. ICPI certified. Est. 2013.",
    ),
    "solutions/flooding-backyard/index.html": (
        "Backyard flood mitigation in Hamilton, Burlington, Oakville. Swales, catch basins, sump discharge &amp; regrading. ICPI certified, $5M liability, Est. 2013. Free online estimate.",
        "Backyard flood mitigation in Hamilton, Burlington, Oakville &amp; Milton. Swales, catch basins, sump discharge &amp; regrading. ICPI certified. Est. 2013.",
    ),
    "solutions/interlock-repair/index.html": (
        "Interlock repair in Hamilton, Burlington, Oakville. Unilock &amp; Techo-Bloc authorized installers. Lift-and-relay, polymeric re-sanding, ICPI certified. Free online estimate.",
        "Interlock repair in Hamilton, Burlington, Oakville &amp; Milton. Unilock &amp; Techo-Bloc authorized. Lift-and-relay, polymeric re-sanding. ICPI certified.",
    ),
}


def main():
    changed = 0
    problems = []
    for rel, (old, new) in REPLACEMENTS.items():
        path = ROOT / rel
        if not path.exists():
            problems.append(f"MISSING: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        count = text.count(old)
        if count == 0:
            problems.append(f"OLD not found: {rel}")
            continue
        new_text = text.replace(old, new)
        path.write_text(new_text, encoding="utf-8")
        # verify new length
        new_display = len(_html.unescape(new))
        tag = "OK " if new_display <= 170 else "TOO LONG"
        print(f"{tag}  {new_display:4d}  {rel}  ({count}x replaced)")
        changed += 1
    print(f"\nChanged {changed} files")
    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print("  " + p)


if __name__ == "__main__":
    main()

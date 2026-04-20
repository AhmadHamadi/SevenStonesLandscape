"""
Rewrite the VISIBLE FAQ HTML block on each solutions page so it matches the
unique JSON-LD FAQ schema. Without this, duplicate Q&A text remains visible
to Google in the HTML body across all 10 pages — a major duplicate-content signal.
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOLUTIONS_DIR = ROOT / "solutions"

# Same content as dedupe_solutions_faq.py — reused here for the visible HTML.
FAQ_BY_SLUG: dict[str, list[tuple[str, str]]] = {
    "patio-sinking": [
        ("Why is my interlock patio sinking after only a few years?",
         "Most patios that sink within 3 to 7 years were built on an under-compacted base or less than 6 inches of 3/4-clear crushed stone. Southern Ontario clay soils retain winter moisture; when frost lifts and thaw drops the subgrade, any weakness in the base shows up as dips, tilting pavers, or settled corners near the house or a downspout outlet."),
        ("Can you fix a sunken patio without replacing all the pavers?",
         "Yes, if the pavers themselves are intact. We lift the affected zone, remove the bedding sand, add and compact fresh 3/4-clear aggregate in 2-inch lifts, screed new bedding, and reset the original pavers to matching elevation. A partial reset typically costs 40 to 60 percent less than a full rebuild."),
        ("How deep should the base be under a patio in Ontario?",
         "For a residential patio on clay or silt soil in Hamilton, Burlington or Oakville, we install a minimum 6-inch compacted base of 3/4-clear limestone with geotextile fabric below. Driveways and pool decks go to 8 to 10 inches. Correct base depth is the single biggest factor in whether a patio stays level through 10+ Ontario winters."),
        ("Will polymeric sand stop my patio from sinking again?",
         "No. Polymeric sand only stabilizes joints between pavers; it does nothing for the base below. If the structural base is under-built or drainage is directing water into it, polymeric sand will crack and wash out as the pavers move. Fixing the base first, then polymeric-sanding the joints, is the correct order."),
        ("Is a sinking patio covered by homeowner's insurance?",
         "Standard Ontario home insurance almost never covers settled patios because it's considered wear, grading, or installation-related rather than sudden damage. The exception is when a plumbing leak or sewer backup undermined the area. Keep photos and any contractor reports; these help if you later pursue the original installer."),
        ("How much does it cost to fix a sinking patio in Hamilton, Burlington or Oakville?",
         "Localized lift-and-relay in a 20 to 50 sq ft area typically runs $1,200 to $2,800. Larger resets with drainage correction fall in the $3,500 to $7,000 range. Full rebuilds with new aggregate, fabric and polymeric joints start around $45 to $75 per square foot depending on paver choice and site access."),
    ],
    "backyard-drainage": [
        ("What's the fastest way to fix a wet backyard in Ontario?",
         "Start by identifying the source: downspouts dumping at the foundation, negative grade toward the house, a low swale full of clay, or a neighbouring property draining in. Most Hamilton and Burlington yards need a combination of positive regrading away from the house (minimum 2% slope for 3 metres), extended downspout lines, and a swale or French drain to intercept runoff before it reaches problem areas."),
        ("Do I need a French drain or will regrading be enough?",
         "If water pools only after heavy rain and your lot already has workable slope, regrading alone often solves it. If the yard stays wet for days, has heavy clay, or sits at the low point of the neighbourhood, a French drain (4-inch perforated pipe in washed stone, wrapped in filter fabric) is the correct solution. We often recommend both: regrade the surface, then install a French drain in the problem zone."),
        ("Can I connect backyard drainage to the city storm sewer?",
         "In Hamilton and Burlington, residential yard drainage generally cannot be tied directly into the municipal storm sewer without city approval. Most homeowners daylight the drain line to a permitted discharge point at the property's low edge, into a dry well sized to infiltration rate, or to a rear-yard catch basin. Never connect to the sanitary sewer, that's a code violation."),
        ("Does clay soil make backyard drainage harder in Hamilton?",
         "Yes. Escarpment and lower-city Hamilton, Ancaster Heights and Dundas all have heavy clay that drains at less than 1 inch per hour. Standard infiltration systems fail on clay. We use above-grade swales, French drains wrapped in non-woven filter fabric with larger 3/4-clear washed stone, and positive surface grading to move water off the property rather than trying to soak it in."),
        ("How much does backyard drainage cost in Hamilton, Burlington or Oakville?",
         "A downspout extension and regrade job typically runs $1,800 to $4,500. A mid-size French drain with catch basin and discharge installation is $3,500 to $8,000. Full lot regrade with drainage, topsoil and sod sits in the $9,000 to $18,000 range. Oakville and lakefront Burlington properties with access or engineered-fill constraints run higher."),
        ("Will drainage work kill my existing lawn?",
         "Trenched French drains leave a 12 to 18 inch disturbed strip that we top-dress and re-sod the same day; the seam is invisible within a season. A full regrade strips and replaces the entire lawn surface. If you want to preserve mature turf or specimen plantings, we can work around them, but it raises labour cost and limits how perfectly the new grade ties in."),
    ],
    "yard-grading-drainage": [
        ("How much slope should a backyard have away from the house?",
         "Ontario Building Code and industry standard call for a minimum 2% slope (roughly 6 inches of fall over the first 10 feet) away from the foundation. Past 10 feet, 1% is acceptable for turf areas. If your yard has less than this, or slopes back toward the house, regrading is the only permanent fix for foundation seepage, wet basements and patio heave."),
        ("Can I regrade my yard without removing the sod?",
         "Only if you're adding 1 inch or less of topsoil; any more and the existing grass suffocates and dies within weeks. For meaningful grade correction (2+ inches of fall) we strip the sod, shape the subgrade with bulk screened topsoil, compact gently, and install fresh Kentucky Bluegrass sod or over-seed. Trying to shortcut this wastes the investment."),
        ("Does yard regrading require a permit in Hamilton, Burlington or Oakville?",
         "Most homeowner-scale regrading does not require a permit as long as you do not alter the approved lot-grading plan on file with the city, direct water onto a neighbour's property, or disturb a protected slope. Hamilton, Burlington and Oakville all enforce lot-grading bylaws — if your house is newer than 2005, there is likely a recorded grading plan you must respect."),
        ("How do you regrade a yard that slopes toward a neighbour's fence?",
         "We build a swale (shallow, turf-covered channel) that runs parallel to the fence line and daylights to the street, a rear-yard catch basin, or a dry well on your own property. Ontario common law doesn't allow you to send concentrated runoff to your neighbour; the swale must spread or capture water within your lot lines."),
        ("What's the difference between yard grading and drainage?",
         "Grading is the shape of the ground surface — how water moves across it. Drainage is the system that collects and conveys water away (French drains, catch basins, sump discharges, dry wells). Grading alone works when soil drains well and water just needs direction. Clay-heavy Hamilton and Burlington lots almost always need both."),
        ("How much does yard grading cost per square foot in Ontario?",
         "Small spot-grading around a downspout is $800 to $1,500. A rear-yard regrade with sod (1,500 to 3,000 sq ft) typically runs $6 to $11 per square foot installed. Full lot regrading including front, side and back with engineered topsoil, swales and sod is $45,000 to $90,000 on a standard 50-foot suburban lot."),
    ],
    "water-pooling-yard": [
        ("Why does water pool in the same spot in my yard every spring?",
         "Recurring pooling means the low point is below surrounding grade and the soil there can't absorb water fast enough. In Ontario clay, infiltration is under 0.5 inch per hour, so anything holding more than that puddles. The fix is always one or more of: raise the low area with topsoil, cut a swale to daylight the water, or install a French drain or dry well sized to absorb the volume."),
        ("Will a dry well solve water pooling in heavy clay soil?",
         "A dry well works only if the surrounding soil can accept water. In clay-heavy Hamilton, Ancaster and parts of Oakville, a standard 4-foot dry well often fills and stays full. We either use an oversized dry well (6-foot diameter, lined with non-woven filter fabric) combined with an overflow outlet, or skip the dry well entirely and daylight the drain to grade at a lower spot on the property."),
        ("How long is too long for water to sit in my yard?",
         "If standing water remains more than 24 to 48 hours after rain stops, you have a drainage problem, not just wet weather. Water sitting that long kills turf roots, breeds mosquitoes (West Nile vector species lay eggs in as little as 4 days), and saturates the soil so the next rainfall has nowhere to go."),
        ("Can extending my downspouts fix yard pooling?",
         "If the pooling is within 10 feet of a downspout, yes — extending to a permitted daylight discharge 15+ feet from the foundation often solves it entirely and costs under $1,500. If the pool is elsewhere or fed by surface runoff from neighbours or a slope, downspout work alone won't be enough and you'll need regrading or a French drain."),
        ("Is water pooling damaging my foundation?",
         "If pooling is within 6 feet of the house, yes — hydrostatic pressure drives water through foundation cracks and damages parging, footings and basement finishes. Foundation repair costs typically run $15,000 to $40,000; fixing the exterior grading and drainage to prevent pooling is $3,000 to $8,000. Always fix the water source first."),
        ("How do you fix water pooling in a flat suburban backyard?",
         "Flat lots in Milton, Mississauga and newer Burlington subdivisions are the hardest to drain because there's nowhere for water to go by gravity. We use a combination of strategic low-profile swales hidden in planting beds, a centrally-placed catch basin piped to the side yard, and rear-yard topsoil build-up to create the 2% minimum slope. Total cost usually $7,000 to $14,000."),
    ],
    "lawn-drainage-problems": [
        ("Why does my lawn stay soggy long after it rains?",
         "A soggy lawn in Ontario usually means one of three things: compacted subsoil (typical on 2-to-10 year old subdivision lots where construction equipment ran over future lawn areas), thatch buildup over 1 inch thick that blocks water infiltration, or a clay subgrade under a thin layer of screened topsoil. Core aeration addresses the first two; the third requires mechanical drainage correction."),
        ("Will core aeration fix lawn drainage problems?",
         "Core aeration helps moderately — it opens 2 to 4 inch plugs that let water and oxygen reach the root zone, and it relieves compaction in the top 3 inches. It will not fix deep subsoil drainage, heavy clay at depth, or incorrect grading. For those, you need regrading or a French drain. Aerating in October, on clay lawns, shows the best improvement."),
        ("What's the difference between a drainage problem and overwatering?",
         "Overwatering makes turf chronically wet and encourages fungal disease; reducing the sprinkler schedule fixes it in weeks. A true drainage problem means the yard is wet even without irrigation, after natural rainfall or snow melt. If the lawn stays wet with zero watering, the problem is grading, soil structure or subgrade — not the hose."),
        ("Can poor lawn drainage cause mushrooms, moss and yellow patches?",
         "Yes. Mushrooms and moss are direct indicators of saturated, oxygen-deprived root zones; they thrive where healthy Kentucky Bluegrass or Fescue can't survive. Yellow patches are usually the dying grass above a saturated root zone. Fixing the drainage almost always returns the turf to healthy green within one growing season, though sometimes over-seeding or re-sodding is needed."),
        ("How do I tell if my lawn has compacted soil or a drainage problem?",
         "Push a 12-inch screwdriver into wet turf. If it stops at 3 inches, you have compaction — aerate and top-dress. If it goes in easily but water still sits on the surface, you have a grading or subsoil drainage problem. If there's a squelching sound and water beads up around the screwdriver, the subgrade is saturated and you need mechanical drainage."),
        ("What does it cost to fix a lawn drainage problem in Ontario?",
         "Core aeration and top-dressing with compost/sand mix is $400 to $900 for an average suburban lawn. Subsurface French drain installation under a lawn is $3,500 to $7,500. Full strip-and-regrade-and-re-sod for a 2,000 sq ft lawn runs $9,000 to $16,000. Diagnosis first is critical — the wrong fix is wasted money."),
    ],
    "interlock-repair": [
        ("When should I repair interlock vs replace it?",
         "Repair when pavers are structurally intact (no cracks over 1/8 inch, no crumbling edges, no efflorescence that won't clean off) and failure is limited to under 25% of the surface. Replace when the base is failed over a wide area, pavers are discontinued, or polymeric sand has failed repeatedly because the base is moving. Replacing costs more up front but lasts 25+ years vs 3 to 5 years of repeated repairs."),
        ("How do you repair sunken or lifted interlock pavers?",
         "We lift the affected zone using a suction-cup lifter or pry bars (no chipping the pavers), remove the bedding sand, add and compact fresh 3/4-clear stone in 2-inch lifts to correct the base, screed new 1-inch bedding sand, re-lay the original pavers to line and grade, compact with a plate tamper and rubber mat, then polymeric-sand and activate the joints."),
        ("Can you match pavers on an old interlock patio or driveway?",
         "For pavers installed after 2015, Unilock and Techo-Bloc lines are mostly still in production — matching is easy. For older Roman Classic, Holland Stone or discontinued Unilock colours, exact matches are rarely possible; we typically borrow from a hidden area (under a deck, along a fence line) and use slightly-off replacement pavers there instead, where they're invisible."),
        ("What causes polymeric sand to crack and wash out?",
         "Three main causes: (1) base movement — pavers shifting micro-fractures the sand; (2) poor installation — sand not properly activated with water or installed in wet conditions; (3) end-of-life — quality polymeric sand lasts 5 to 10 years before UV and freeze-thaw break it down. Fresh polymeric sand installed over a moving base will fail within 12 months."),
        ("How much does interlock repair cost in Hamilton, Burlington or Oakville?",
         "Re-sanding joints only: $2 to $4 per square foot. Lift and relay a 20 to 40 sq ft failed area: $900 to $2,200. Full driveway repair with 2 to 3 localized lift-and-relay zones plus fresh polymeric sanding: $2,500 to $5,500. Edge restraint replacement adds $15 to $25 per linear foot."),
        ("Does polymeric sand need replacing and how often?",
         "Yes. Quality polymeric sand (Techniseal HP Next-Gel, Gator Maxx G2, Alliance Gator Polymeric Super Sand) lasts 5 to 10 years in Ontario conditions. Signs it's time to replace: visible gaps at joints, sand washing onto lawn after rain, weeds appearing between pavers, ants burrowing through joints. Re-sanding is a 1 to 2 day job for most residential installations."),
    ],
    "uneven-interlock": [
        ("At what height difference is uneven interlock a trip hazard?",
         "The Ontario Occupational Health and Safety standard and most insurance standards flag a lippage (vertical offset between adjacent pavers) over 1/4 inch (6 mm) as a trip hazard. Over 1/2 inch is considered a liability risk on residential walkways and commercial entries. If you're hosting visitors or listing the property, any lippage over 1/4 inch should be corrected."),
        ("Why does one side of my interlock patio sink more than the other?",
         "Differential settlement almost always means base preparation varied across the installation: a deeper base on one side, different fill material, a downspout concentrating water on the low side, or one side built over previously excavated ground (utility trench, old tree stump). Fixing requires lifting the sunken zone and rebuilding that section's base to match the intact side."),
        ("Can uneven interlock be corrected without a full rebuild?",
         "Yes, in most cases. We isolate the lifted or sunken zone, lift the affected pavers, correct the base to match surrounding levels (add or remove compacted stone as needed), reinstall the original pavers and re-sand. This is successful when lippage is under 1 inch and the affected area is under 30% of the surface. Beyond that, full rebuild is more cost-effective."),
        ("What causes edge pavers to tilt and separate from the patio?",
         "Edge restraint failure. Interlock requires a rigid edge — either a plastic edge restraint pinned with 10-inch spikes every 12 inches, or a concrete haunch poured below grade. When the edge fails (spikes heaved out by frost, or concrete haunch cracked), the perimeter pavers slide outward and tilt. Replacing the edge restraint and resetting the affected pavers solves it permanently."),
        ("How do you prevent interlock from becoming uneven in the first place?",
         "Three non-negotiables in Ontario: (1) minimum 6-inch compacted base for patios, 8 to 10 inches for driveways — 3/4-clear crushed limestone, installed over non-woven geotextile fabric; (2) proper edge restraint installed before polymeric sanding; (3) polymeric joint sand (not regular stone dust) in all joints. Installations skipping any of these develop lippage within 3 to 5 winters."),
        ("How much does it cost to level uneven interlock in Ontario?",
         "Spot-level and relay 10 to 20 sq ft: $600 to $1,500. Relay a 50 to 100 sq ft zone with base correction: $2,000 to $4,500. Full driveway or large patio re-levelling with edge restraint replacement: $4,500 to $9,000. If the pavers are heavily damaged or the base is systemically under-built, rebuild ($45 to $75/sq ft) is more cost-effective."),
    ],
    "retaining-wall-repair": [
        ("How do I know if my retaining wall is failing?",
         "Warning signs, in order of severity: (1) leaning — a plumb line from the top of the wall falling outside the base footprint; (2) bulging — blocks pushed outward mid-height; (3) cracking — stepping cracks through mortar joints or across block faces; (4) separating courses — horizontal gaps opening between block rows; (5) leaning into standing water behind the wall. Any of these, especially on walls over 3 feet tall, means engineer assessment within 30 days."),
        ("Can a leaning retaining wall be straightened or does it need rebuilding?",
         "A wall leaning under 2 degrees (about 1 inch over a 3-foot height) with no bulging can sometimes be stabilized with helical tieback anchors and regrading behind the wall. Leaning over 2 degrees or showing any bulging requires demolition and rebuild with proper drainage and geogrid reinforcement. Stabilization costs roughly 60% of rebuild and carries a shorter warranty."),
        ("Do retaining wall repairs in Ontario need a permit?",
         "Walls under 1 metre (about 3 ft 3 in) exposed height generally do not require a permit in Hamilton, Burlington, or Oakville. Walls over 1 metre require a permit and engineered drawings in most Ontario municipalities. Repair of an existing over-1m wall is treated the same as new construction for permit purposes — get the permit before demolition."),
        ("Why does water behind the retaining wall cause failure?",
         "Saturated clay soil exerts hydrostatic pressure and lateral earth pressure up to 3 times the dry-soil load. Over winter, that water freezes and expands at 9% volume, pushing blocks outward. Proper walls include a drainage chimney of 3/4-clear stone against the back face, a 4-inch perforated drain pipe at the base daylighted to grade, and filter fabric — missing any of these is the most common failure cause."),
        ("What does retaining wall repair cost in Hamilton, Burlington or Oakville?",
         "Minor cap or face repair: $500 to $2,000. Rebuild of a 15 to 30 linear foot section under 3 feet tall: $4,500 to $11,000. Engineered rebuild of a 4 to 6 foot tall wall with drainage and geogrid: $225 to $400 per linear foot. Full demolition and rebuild of a large segmental wall with permit: $25,000 to $60,000."),
        ("How long should a properly built retaining wall last in Ontario?",
         "A correctly engineered segmental block wall (Allan Block, Unilock Pisa2, Techo-Bloc Mini-Creta) with drainage chimney, perforated drain pipe and geogrid reinforcement should last 50+ years. Armour stone walls last 100+ years. Mortared natural stone walls last 40 to 60 years if flashed correctly. Walls failing in under 15 years almost always lacked drainage, not stone."),
    ],
    "sod-turning-yellow": [
        ("Why is my new sod turning yellow weeks after installation?",
         "Yellowing in the first 2 to 4 weeks post-install almost always means under-watering. New sod needs 1 to 2 inches of water per day for the first 14 days, dropping to 1 inch every 2 to 3 days through week 4. In Ontario summers, that's often 45 to 60 minutes of sprinkler per zone, daily. Sod that dries out and yellows can usually be recovered in the first 3 weeks."),
        ("Is yellow sod dead or can it be saved?",
         "Pull up a corner. If the roots are white, moist and anchored — the sod is dormant from stress and will recover with consistent deep watering. If the roots are brown, brittle and pull away with no resistance, that section is dead and needs re-sodding. Most yellowing sod in the first month is recoverable; yellow after 6 weeks usually isn't."),
        ("Can I overwater new sod and cause yellowing?",
         "Yes. Over 2 inches of water per day in the first week creates anaerobic root conditions, fungal growth (Pythium, brown patch), and root rot. The leaves turn yellow-green and mushy. Stick to 1 to 2 inches daily, adjust down when leaves look uniformly wet, and only water between 4 AM and 9 AM so leaves dry before evening."),
        ("Why is my sod yellow only in patches?",
         "Patch yellowing usually has a local cause: dog urine spots (high nitrogen burn — rinse with 10x water), fertilizer spill, old diesel or oil spot under the sod, a shallow utility trench with different soil, a broken sprinkler head, or a fungal disease outbreak. Map the pattern: circular = fungal or urine; linear = utility trench or edge effect; spray = sprinkler."),
        ("When is it too late to install sod in Ontario to avoid yellowing?",
         "Optimal sod-install windows in Southern Ontario: April 15 to June 20, and August 20 to October 15. Installing between June 20 and August 20 requires aggressive watering (2 inches daily) and often still yellows from heat stress. After October 25, root establishment before winter is uncertain. Outside optimal windows, expect a 20 to 40% re-sod rate the following spring."),
        ("How much does it cost to re-sod a yellow or dead lawn in Ontario?",
         "Full lawn re-sod (strip, grade, topsoil, sod) runs $1.80 to $2.80 per square foot installed for Kentucky Bluegrass or Bluegrass-Fescue blend. A 2,500 sq ft lawn is typically $5,000 to $7,500. Spot-patching under 200 sq ft is $500 to $1,200. Milton and Mississauga pricing is 5 to 10% higher due to access and dumping fees."),
    ],
    "flooding-backyard": [
        ("Why does my backyard flood after every heavy rain?",
         "Backyard flooding in Ontario has four common root causes: (1) negative grade — yard slopes toward the house; (2) blocked, undersized, or missing drainage infrastructure; (3) clay subsoil that can't absorb rainfall fast enough; (4) concentrated runoff from a neighbour's property or rooftop. Most yards have 2 or 3 of these together. Diagnosis comes first, then a combined solution of regrading, French drains, and catch basins."),
        ("Can my backyard flooding damage my foundation?",
         "Yes, significantly. Water pooling within 6 feet of the foundation creates hydrostatic pressure that drives water through concrete cracks, parging, and window wells. Typical foundation waterproofing repair runs $18,000 to $45,000. Fixing the yard to prevent flooding costs $4,000 to $14,000. Address the yard first — it's cheaper and usually solves the basement problem."),
        ("How do you stop a neighbour's yard from flooding yours?",
         "Ontario law requires each property to manage its own runoff and not direct concentrated water onto neighbouring land. If a neighbour's grading or downspout discharge is flooding you, start with a friendly conversation, then the municipal lot-grading inspector (Hamilton, Burlington and Oakville all enforce this). On your side, an interceptor swale or French drain at the shared property line captures runoff before it crosses."),
        ("Will a sump pump solve backyard flooding?",
         "A sump pump moves water out of a sealed basin but doesn't collect it from the yard. To be effective against backyard flooding, you need a catch basin or dry well at the yard's low point, piped to a sump pump that discharges safely (15+ feet from the foundation, with a frost-proof check valve). Pump alone, with no collection system, does nothing for yard flooding."),
        ("Does insurance cover backyard flooding damage in Ontario?",
         "Standard Ontario home insurance rarely covers outdoor flooding or gradual water damage. Overland water and sewer backup riders (extra premium $100 to $400/year) cover interior damage from exterior flooding but not the yard itself. Hardscape washouts, sod loss and grading damage are generally treated as maintenance, not insurable events. Document everything with photos before and after."),
        ("What does it cost to flood-proof a backyard in Hamilton, Burlington or Oakville?",
         "Extended downspout discharges and a spot regrade: $1,800 to $4,500. Full regrade with swales and one catch basin: $7,000 to $14,000. Engineered drainage system with buried pipe network, multiple catch basins, and pump discharge: $18,000 to $42,000. Oakville lakefront and ravine-back properties are usually in the higher range due to access and discharge-permit requirements."),
    ],
}


# Match the <div class="faq-list" ... >...</div></div></div></section> block.
# Capture the outer structure so we can preserve it and only swap the inner items.
FAQ_VISIBLE_PATTERN = re.compile(
    r'(<div class="faq-list"[^>]*>)(.*?)(</div></div></div></section>)',
    re.DOTALL,
)


def build_faq_items(qa_pairs: list[tuple[str, str]]) -> str:
    items = []
    for q, a in qa_pairs:
        q_esc = html.escape(q)
        a_esc = html.escape(a)
        items.append(
            f'<div class="faq-item">'
            f'<button type="button" class="faq-question" aria-expanded="false">{q_esc}</button>'
            f'<div class="faq-answer"><div class="faq-answer-inner">{a_esc}</div></div>'
            f'</div>'
        )
    return "".join(items)


def main() -> None:
    changed = 0
    for slug, qa in FAQ_BY_SLUG.items():
        path = SOLUTIONS_DIR / slug / "index.html"
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
    print(f"done; {changed} solutions pages updated")


if __name__ == "__main__":
    main()

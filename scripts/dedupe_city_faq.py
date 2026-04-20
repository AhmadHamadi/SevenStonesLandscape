"""
Replace duplicate FAQPage schema on 9 city pages with unique, city-specific Q&A
that references real neighbourhoods, soil conditions, local permits, and pricing specifics.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CITIES_DIR = ROOT / "service-areas"


CITY_FAQ: dict[str, list[tuple[str, str]]] = {
    "hamilton": [
        ("What Hamilton neighbourhoods do you serve for interlock and landscaping?",
         "We work across all of Hamilton: Westdale, Kirkendall, Ainslie Wood, Durand and Corktown in the lower city; Stoney Creek, Winona and Fifty Point on the east end; the Hamilton Mountain including Rymal, Stoney Creek Mountain and Upper James corridor; Ancaster Heights and Meadowlands; and Dundas and Flamborough. Each area has different soil, slope and permit conditions we account for in the quote."),
        ("Does the Niagara Escarpment affect landscaping work in Hamilton?",
         "Yes, significantly. Properties backing onto the Escarpment — parts of Ancaster, Stoney Creek Mountain edge, Sanatorium Road, and Queen Street Hill — often fall under Niagara Escarpment Commission (NEC) jurisdiction. Retaining walls, grade changes and tree removal in these zones require NEC approval in addition to the City of Hamilton permit. We handle the paperwork and adjust designs to meet NEC development permit requirements."),
        ("Do I need a permit for a retaining wall or patio in Hamilton?",
         "In Hamilton, retaining walls over 1 metre (about 3 ft 3 in) exposed height require a building permit and engineered drawings. Ground-level patios and walkways do not need a permit. Driveway widening or re-paving requires a Right-of-Way permit if the curb or boulevard is altered. We pull permits through Hamilton's online portal and typical turnaround is 2 to 4 weeks for residential wall permits."),
        ("How does Hamilton clay soil affect patio and driveway installation?",
         "Most of lower Hamilton, the Mountain brow, and parts of Ancaster sit on Halton Till — a dense grey clay that holds water and heaves in winter. We counter this with a minimum 8-inch compacted 3/4-clear limestone base under driveways, 6 inches under patios, non-woven geotextile fabric on the subgrade, and positive surface drainage. Shortcut installations without these fail within 3 to 5 winters on clay."),
        ("What does a typical interlock driveway cost in Hamilton?",
         "For a 2-car interlock driveway (400 to 600 sq ft) in Hamilton using standard Techo-Bloc or Unilock pavers, installed over a proper 8-inch base with polymeric joint sand and edge restraint, expect $28,000 to $48,000. Premium pavers (Unilock Artline, Techo-Bloc Borealis) add 15 to 25%. Lower-city Hamilton with tight access or escarpment properties requiring excavated fill removal run higher."),
        ("Can you work on Hamilton heritage properties?",
         "Yes. Heritage-designated properties in Durand, Corktown, and parts of Dundas require Heritage Permit approval from Hamilton's Heritage Planning before any exterior hardscape or visible landscape change. We've worked on properties under Ontario Heritage Act Part IV and Part V designations; expect an additional 4 to 8 weeks in the timeline for heritage permit review."),
        ("Which Hamilton areas have the worst drainage problems?",
         "Low-lying areas around the Red Hill Valley, parts of Westdale near Cootes Paradise, the base of the Mountain along Queen/West 5th, and older Stoney Creek streets built before current grading standards all have chronic drainage issues. Ravine-lot homes in Ancaster (Sulphur Springs) also struggle with slope water. We pair grading with French drains and engineered swales for these areas."),
        ("Do you install retaining walls on Hamilton Mountain properties?",
         "Yes. Mountain-edge homes in Stoney Creek Mountain, Ancaster Heights and along the brow often need engineered segmental walls 4 to 8 feet tall. These require engineered drawings, geogrid reinforcement, proper drainage chimneys, and Hamilton building permits. We use Allan Block, Unilock Pisa2, or armour stone depending on aesthetic preference and engineering load requirements."),
        ("What's the best time of year for hardscape work in Hamilton?",
         "April through early December is our main installation window. Interlock and retaining walls can be installed through winter if ground is not frozen, but spring and early summer (April to June) give the best polymeric sand cure and the longest use of the finished space. We book 6 to 10 weeks ahead in peak season; fall bookings (September to November) often have more flexibility and better pricing."),
        ("How long have you worked in Hamilton and what's your warranty?",
         "Seven Stones Landscape has been serving Hamilton since 2013. We carry full WSIB coverage, $5M commercial general liability, and are ICPI (Interlocking Concrete Pavement Institute) certified, Landscape Ontario members, and authorized Unilock and Techo-Bloc installers. Our hardscape warranty is 5 years on workmanship for most projects, with manufacturer warranties on pavers (lifetime limited from Unilock and Techo-Bloc)."),
        ("Do you handle drainage and grading on Hamilton escarpment and ravine lots?",
         "Yes — these are some of the most technical projects we do. Escarpment-back lots in Ancaster and Stoney Creek Mountain have specific slope stability, drainage, and NEC-regulated tree retention requirements. We coordinate with arborists and, where needed, geotechnical engineers. Our approach prioritizes infiltration-first drainage where soil allows, and engineered daylighting where it doesn't."),
        ("What financing or payment options are available for Hamilton projects?",
         "For projects over $15,000 we offer a structured payment schedule: 25% deposit to book materials, 35% at excavation, 35% at substantial completion, 5% holdback until 30-day warranty inspection. We don't offer in-house financing but many of our Hamilton clients use HELOC or home-improvement loans; all pricing is firm and written, no change-order surprises."),
    ],
    "burlington": [
        ("Which Burlington neighbourhoods do you work in?",
         "We serve all of Burlington: Roseland, Shoreacres and the lakefront estate areas; Aldershot, Tyandaga and LaSalle; downtown Burlington and Brant; Mountainside and Palmer; Alton Village and Orchard; Millcroft and Headon Forest. Each neighbourhood has distinct soil, lot size and heritage considerations that we factor into the design and quote."),
        ("Do I need a permit for landscaping in Burlington?",
         "Burlington requires a building permit for retaining walls over 1 metre exposed height, and a Right-of-Way permit for any work that affects the municipal boulevard, curb, or existing driveway approach. Ground-level patios, walkways, sod, and grading on private property generally do not need permits. Burlington's Tree Bylaw also protects trees over 20 cm in diameter — removal requires a permit and replacement planting."),
        ("How do Roseland and Shoreacres projects differ from other Burlington areas?",
         "Roseland, Shoreacres and the lakeshore estate streets have larger lots (often 80 to 150 ft frontage), mature tree canopy, and heritage-character neighbourhoods. Many homes have existing high-end hardscape that needs to be matched or upgraded to comparable quality. Projects here typically use premium materials (Techo-Bloc Borealis, Unilock Artline, natural flagstone, armour stone) and expected investment is 30 to 50% above general Burlington averages."),
        ("What soil conditions are common in Burlington?",
         "Most of Burlington sits on glacial till with varying clay content. Shoreacres and lakefront properties often have sandier, better-draining soil. Aldershot and Tyandaga backing onto the Niagara Escarpment have rocky, shallow topsoil over limestone. Alton Village and Orchard (newer subdivisions) were built on heavily-compacted clay subgrades that need aeration and drainage correction after construction."),
        ("Does the Niagara Escarpment Commission affect Burlington properties?",
         "Yes, for homes in Aldershot, Tyandaga, and along the escarpment brow from Mount Nemo to Kerns Road. Properties within the NEC Area of Development Control need NEC approval for retaining walls, significant grade changes, and some tree removals. This is in addition to the Burlington building permit. We handle NEC development permit applications as part of the project scope."),
        ("What does interlock cost for a typical Burlington driveway?",
         "A 2-car Burlington interlock driveway (400 to 600 sq ft) with standard Unilock or Techo-Bloc pavers, 8-inch compacted base, polymeric sand, and edge restraint runs $28,000 to $48,000. Roseland and Shoreacres premium-paver installations with decorative banding and specialty finishes commonly run $55,000 to $85,000. We provide a firm written quote after on-site review."),
        ("How close to the lake can you install hardscape in Burlington?",
         "Properties within 30 metres of Lake Ontario's high-water mark fall under Conservation Halton jurisdiction for shoreline work. For hardscape within that zone — terraces, retaining walls, shoreline steps — we coordinate with Conservation Halton's permit process (typically 6 to 12 weeks). Erosion protection, drainage daylighting, and native planting integration are common requirements for waterfront projects."),
        ("How do you handle drainage on Burlington's new subdivision lots?",
         "Alton Village, Orchard, Millcroft and newer Headon Forest homes often have lot-grading plans on file with the city that we must respect. We work within the approved grading plan to add swales, French drains, and catch basins without altering the approved surface elevations at property lines. For homes less than 7 years old, the original lot-grading certificate typically still applies."),
        ("Do you install pool surrounds and pool decks in Burlington?",
         "Yes, pool surrounds and pool decks are a core service across Burlington. We handle Halton Region pool enclosure bylaw requirements (4-foot minimum fence, self-closing gate), proper drainage away from the pool, slip-resistant paver selection (we recommend Unilock ArmourCore or Techo-Bloc Blu 60 for pool surrounds), and integration with existing fencing. Typical pool-surround projects in Burlington run $35,000 to $95,000."),
        ("What's the warranty and credentials on Burlington work?",
         "Seven Stones Landscape is ICPI certified, Landscape Ontario members, and authorized installers for Unilock and Techo-Bloc. We carry $5M liability insurance and full WSIB coverage. Our workmanship warranty is 5 years on hardscape (base, edge restraint, settlement over 1/2 inch). Paver manufacturer warranties are lifetime limited from Unilock and Techo-Bloc. Residential projects since 2013."),
        ("What's the best time of year to book a Burlington project?",
         "Our Burlington schedule books 6 to 12 weeks ahead during peak season (May through August). If you want spring completion, quote in February or March. Fall projects (September to November) have more flexibility and often favourable pricing. Winter is typically design, quote, and pre-order phase; installations start when ground is reliably workable (usually by mid-April)."),
        ("Can you match or extend existing hardscape on a Burlington property?",
         "Yes. For Unilock and Techo-Bloc product lines installed within the last 8 to 10 years, exact matches are usually possible. Older or discontinued pavers (common on 20+ year old Roseland and Shoreacres estates) require creative sourcing — we borrow pavers from a hidden area, use a closely-matched replacement there, and extend with the matching product in the visible expansion. Match planning is part of our free on-site consultation."),
    ],
    "oakville": [
        ("Which Oakville neighbourhoods do you serve?",
         "We work throughout Oakville: Old Oakville and Morrison for heritage and estate work; Eastlake for lakefront and large-lot projects; Glen Abbey and Bronte Creek for golf-course community homes; Bronte village lakefront; Joshua Creek and Iroquois Ridge North for mid-to-large suburban properties; West Oak Trails, River Oaks and Uptown Core for newer executive homes. Each area has distinct lot size, soil, and permit profile."),
        ("Do I need a permit for landscaping in Oakville?",
         "Oakville requires a building permit for retaining walls over 1 metre exposed height, with engineered drawings for walls over 1.2 metres or near property lines. The Town of Oakville Tree Bylaw protects trees 30 cm+ in diameter — removal needs a permit with replacement planting. Oakville also has strict private-tree protection in neighbourhoods like Old Oakville and Eastlake where heritage trees may require arborist reports."),
        ("How do Eastlake and Old Oakville projects differ from the rest of Oakville?",
         "Eastlake and Old Oakville have the largest lots, mature 80+ year-old tree canopy, heritage architecture, and some of the highest hardscape investment standards in the GTA. Properties here typically use natural stone, premium pavers (Unilock Artline, Techo-Bloc Borealis, Indiana Limestone, Wiarton flagstone), and integrated lighting. Expected project investment is often 2 to 3 times general Oakville averages, and heritage-tree protection requirements extend timelines."),
        ("What soil types are common in Oakville?",
         "North Oakville (Iroquois Ridge, River Oaks, West Oak Trails) sits on heavy clay till with notoriously poor drainage — newer subdivisions almost always need drainage correction post-construction. South Oakville and lakefront areas (Eastlake, Old Oakville, Bronte) have better-draining sandy loam in most places. Glen Abbey and Bronte Creek have a mix of clay and glacial gravel that varies by block."),
        ("Does Conservation Halton affect Oakville landscape projects?",
         "Yes, particularly for properties within Sixteen Mile Creek, Fourteen Mile Creek, Bronte Creek ravines, and lakefront within 30 metres of Lake Ontario. Any hardscape, grading change, or tree removal in regulated zones requires a Conservation Halton permit (6 to 12 week review). Homes along Lakeshore Road East and West, Morrison Creek, and ravine-backing lots in Joshua Creek and Glen Abbey commonly need these approvals."),
        ("What does a premium Oakville interlock driveway cost?",
         "A standard 2-car Oakville driveway (400 to 600 sq ft) runs $32,000 to $58,000. Premium installations in Eastlake and Old Oakville with Unilock Artline or Techo-Bloc Borealis pavers, decorative banding, integrated low-voltage lighting, and natural stone accent walls often reach $75,000 to $135,000. All quotes include proper 8 to 10 inch compacted base and edge restraint — no shortcuts on the specification."),
        ("How long do projects take in Oakville during the busy season?",
         "A typical Oakville backyard or driveway project takes 1 to 3 weeks of on-site time. Large estate projects in Eastlake or Glen Abbey with pools, multi-level patios, outdoor kitchens, or fire features commonly run 4 to 8 weeks. Our Oakville schedule books 8 to 14 weeks ahead during peak season (April to September). Winter is design and pre-order; installations resume in mid-April once ground is workable."),
        ("Can you handle heritage-designated properties in Old Oakville?",
         "Yes. Heritage-designated properties under Ontario Heritage Act (Parts IV and V) in Old Oakville require Town of Oakville Heritage Permit before exterior changes. Typical review is 4 to 10 weeks. We've delivered projects compliant with Old Oakville Heritage Conservation District guidelines, and we work with heritage consultants when the project scope warrants it. Expect additional timeline and design-review costs for heritage work."),
        ("How do you handle Oakville's mature tree canopy during hardscape work?",
         "Protecting mature trees is central to every Oakville project. We install tree protection zone (TPZ) fencing per Town standards (typically 10× trunk diameter in radius), hand-excavate within root zones, use air-spade or hydrovac when digging near significant roots, and avoid soil compaction under canopy. For heritage-scale trees we coordinate with a certified arborist and may require arborist report before permit."),
        ("What's the workmanship warranty on Oakville projects?",
         "Seven Stones Landscape provides a 5-year workmanship warranty on hardscape (base failure, settlement over 1/2 inch, edge restraint failure, efflorescence cleaning). Paver manufacturer warranties are lifetime limited from Unilock and Techo-Bloc. We're ICPI certified, $5M insured, WSIB-covered, Landscape Ontario members, and authorized Unilock and Techo-Bloc installers. Oakville project portfolio dates to 2013."),
        ("Can you integrate landscape lighting and irrigation into Oakville hardscape?",
         "Yes. Low-voltage landscape lighting (Kichler, FX Luminaire, Vista Pro) is integrated into our Oakville hardscape during base construction — conduit runs are laid before paving so retrofit isn't needed later. Irrigation integration follows the same principle: main-line sleeving under hardscape is installed during base prep. We coordinate with licensed electricians and irrigation contractors for the final connections."),
        ("What Oakville landscape improvements give the best resale value?",
         "In Oakville, top ROI hardscape categories are: (1) updated front walkway and entry landing in natural stone or premium interlock; (2) backyard pool surround upgrade with coping and slip-resistant pavers; (3) finished outdoor living area with integrated fire or kitchen feature; (4) mature front yard regrading with fresh sod and perennial beds. Oakville buyers in the $1.5M+ range typically value landscape quality at 4 to 8% of home value."),
    ],
    "ancaster": [
        ("Which Ancaster neighbourhoods do you serve?",
         "We work across all of Ancaster: Ancaster Heights (the older estate area along Wilson Street); Meadowlands with its newer executive homes; Ancaster Village and the heritage core; rural-residential Sulphur Springs and Jerseyville Road; and the newer subdivisions around Garner Road. Each area has very different lot sizes, soil, and permit paths that shape the design and quote."),
        ("Does the Niagara Escarpment affect Ancaster landscape work?",
         "Yes, significantly. Ancaster properties south of Wilson Street and along Sulphur Springs Road often fall within Niagara Escarpment Commission (NEC) jurisdiction. Retaining walls, significant grade changes, and tree removal in NEC-regulated areas require an NEC Development Permit in addition to Hamilton's building permit. Expect an additional 6 to 12 weeks of review time for NEC-regulated projects."),
        ("What's unique about Ancaster soil and drainage?",
         "Ancaster has three distinct soil zones. The village core and Ancaster Heights sit on shallow soil over bedrock, requiring specific footing strategies. Meadowlands is clay-heavy Halton Till with drainage challenges typical of post-1990 subdivisions. Sulphur Springs and rural Ancaster have sloped sandy loam with surface-water management issues. Each zone gets a different base and drainage specification."),
        ("Do I need a permit for a retaining wall in Ancaster?",
         "Ancaster follows Hamilton bylaws: retaining walls over 1 metre (about 3 ft 3 in) exposed height require a building permit with engineered drawings. Walls on escarpment-slope properties may also need NEC approval and, in some cases, geotechnical engineering. Ancaster Village heritage properties may need Heritage Permit approval. We handle the permit process as part of the project scope."),
        ("What does a typical Ancaster driveway or patio cost?",
         "A standard Ancaster 2-car interlock driveway (400 to 600 sq ft) runs $28,000 to $48,000 with properly specified base. Ancaster Heights estate projects with premium pavers, decorative inlay, and natural stone accents typically run $55,000 to $105,000. Backyard patios range $12,000 to $55,000 depending on size, materials, and whether integrated features (fire pit, pergola, outdoor kitchen) are included."),
        ("Can you work on Ancaster Village heritage properties?",
         "Yes. Ancaster Village has heritage-designated properties under Ontario Heritage Act, and any exterior change needs Heritage Permit review through Hamilton's Heritage Planning. We've completed projects compliant with Ancaster heritage district guidelines. Expect 6 to 10 weeks additional timeline for heritage review and material compatibility verification."),
        ("How do you handle sloped Ancaster properties?",
         "Many Ancaster lots — particularly Sulphur Springs and escarpment-backing Heights properties — have 10%+ grade changes. We design engineered terracing with segmental retaining walls (Allan Block, Unilock Pisa2, or armour stone), integrate proper drainage chimneys behind each wall, and use geogrid reinforcement for walls over 4 feet. Steep-lot work typically includes arborist and geotechnical coordination."),
        ("What services are most requested in Ancaster?",
         "Top requests in Ancaster: (1) interlock driveways with premium banding and lighting; (2) multi-level backyard patios with retaining walls and fire features; (3) pool surrounds for the many estate properties with in-ground pools; (4) full front-yard redesigns with natural stone walkways and mature tree integration; (5) drainage correction on clay-heavy Meadowlands lots."),
        ("How long does an Ancaster project usually take?",
         "Most Ancaster residential hardscape projects take 2 to 4 weeks of on-site time. Larger estate projects with pools, multi-level terraces, or outdoor kitchens run 6 to 10 weeks. Our Ancaster schedule typically books 8 to 12 weeks ahead during peak season. Heritage or NEC-permitted projects need 2 to 3 months lead time for approvals before excavation."),
        ("Are you insured and certified for Ancaster work?",
         "Yes. Seven Stones Landscape carries $5M commercial general liability, full WSIB coverage, ICPI (Interlocking Concrete Pavement Institute) certification, Landscape Ontario membership, and authorized installer status for Unilock and Techo-Bloc. We've worked in Ancaster since 2013 with a 5-year workmanship warranty on hardscape and lifetime limited manufacturer warranties on pavers."),
        ("Do you handle Ancaster rural properties with well and septic?",
         "Yes. Rural Ancaster properties off Sulphur Springs Road and Jerseyville have specific setbacks for well (30 m from hardscape drainage) and septic field (no hardscape over the field, no concentrated drainage to the field). We coordinate with your well and septic records, verify setbacks on-site, and adjust design accordingly. These details are part of the consultation before we quote."),
        ("What landscape investments add the most value to an Ancaster home?",
         "Ancaster buyers, particularly in Heights and Meadowlands, value: (1) finished front-yard curb appeal with premium driveway and walkway; (2) functional outdoor living spaces with proper grading and drainage; (3) mature tree integration and native planting; (4) properly engineered retaining walls on sloped lots. Estate properties in Ancaster often see 3 to 7% home-value uplift from comprehensive landscape investment."),
    ],
    "dundas": [
        ("Which Dundas neighbourhoods do you serve?",
         "We work across all of Dundas: the downtown heritage core around King Street; University Gardens; Pleasant Valley; Governor's Road and the country-residential properties; and the newer Dundana and Dundas Peak areas. Dundas is small but topographically complex — nearly every project interacts with slope, heritage, or escarpment considerations."),
        ("Does the Niagara Escarpment affect Dundas projects?",
         "Almost always. Dundas sits in the valley below the Escarpment, with many properties either on the slope or within view-protection corridors. NEC Development Permits are required for retaining walls, grade changes, and tree removal on Escarpment-facing slopes. Conservation Halton also regulates Spencer Creek and adjacent floodplain areas. Expect 8 to 14 weeks lead time for permits on regulated properties."),
        ("Do I need a heritage permit in Dundas?",
         "Downtown Dundas has a Heritage Conservation District covering much of King Street and surrounding residential streets. Any exterior change visible from the street on a heritage-designated property requires Heritage Permit review from Hamilton Heritage Planning (Dundas is part of amalgamated Hamilton). Typical heritage review is 4 to 10 weeks. Front walkways, driveways, retaining walls, and fences visible from the street are all typically reviewed."),
        ("What's unique about Dundas soil and drainage?",
         "Dundas valley has layered alluvial deposits — sandy loam over gravel in the lower valley, clay on the slopes, and shallow soil over limestone bedrock on the Escarpment edges. Surface water from the Escarpment flows through town via Spencer Creek and many small tributaries. Drainage design in Dundas must account for upslope runoff and regulated floodplain proximity in many areas."),
        ("Can you work on sloped Dundas properties?",
         "Yes — sloped Dundas work is one of our specialties. We design engineered terracing with segmental block or armour stone retaining walls, integrate drainage chimneys, and coordinate with arborists for mature-tree protection. Slopes over 3:1 require engineered drawings and often geotechnical input. Typical sloped-lot terraced-backyard projects in Dundas run $45,000 to $150,000 depending on size and material selection."),
        ("What does a typical Dundas hardscape project cost?",
         "Dundas pricing is similar to Hamilton and Ancaster but with additional premium for heritage, NEC, and Conservation Halton coordination where applicable. Standard interlock driveways (400 to 600 sq ft) run $30,000 to $55,000. Heritage or NEC-regulated projects add 15 to 30% to account for permit timelines, engineering, and material compatibility requirements."),
        ("Are there tree protection rules in Dundas?",
         "Yes. Hamilton's Tree Bylaw applies in Dundas and protects private trees 20 cm+ in diameter. Dundas has a high concentration of mature and heritage trees — removal or significant root-zone disturbance usually requires an arborist report and Tree Bylaw permit. We protect trees in place with TPZ fencing during construction and coordinate arborist input at quote stage for sensitive sites."),
        ("Can you match materials on a heritage Dundas property?",
         "Material matching on Dundas heritage properties is a core part of our approach. We source Wiarton limestone, Indiana limestone, and period-appropriate flagstone to complement heritage homes. For pavers, we use Techo-Bloc Aberdeen, Unilock Hollandstone, and Unilock Courtstone which have heritage-compatible textures. Material selection on heritage work is collaborative with Heritage Planning staff."),
        ("How do Conservation Halton regulations affect Dundas projects?",
         "Properties along Spencer Creek, Logie's Creek, and Borer's Creek fall under Conservation Halton regulations. Hardscape, grading, and tree removal within regulated allowances need CH permits (6 to 12 week review). Properties in the Regulated Flood Plain have additional restrictions on finished grade and permanent structures. We confirm CH status on every Dundas quote before finalizing design."),
        ("How long does Dundas project approval typically take?",
         "Dundas projects with any combination of heritage, NEC, or Conservation Halton approvals typically take 2 to 4 months of permit time before excavation. Non-regulated projects on standard lots follow the normal 2 to 4 week Hamilton building permit timeline. We start permit work immediately after contract signing so construction can begin as soon as ground conditions permit."),
        ("What's your workmanship warranty on Dundas projects?",
         "Seven Stones Landscape provides a 5-year workmanship warranty on hardscape (settlement, edge restraint, base failure) and lifetime limited paver manufacturer warranties from Unilock and Techo-Bloc. We're ICPI certified, $5M insured, Landscape Ontario members. Dundas project portfolio dates back to our founding in 2013 with heritage and slope-work specialization built over a decade."),
        ("Do you coordinate with arborists and engineers on complex Dundas sites?",
         "Yes. Dundas heritage and escarpment sites often require coordinated input from certified arborists (tree protection and removal), geotechnical engineers (slope stability and wall design), and structural engineers (retaining wall drawings for permits). We manage these consultants as part of the project, and their fees are itemized in the quote so you see exactly where the budget goes."),
    ],
    "waterdown": [
        ("Which Waterdown neighbourhoods do you serve?",
         "We work across all of Waterdown: the historic village core; Dundas Street and the Mountain Brow estate area; the newer subdivisions north and east of the village (Academy, Summit Park, Cranston); and rural-residential properties along Safari Road and Millgrove. Waterdown has grown rapidly — lot sizes and permit paths differ sharply between older and newer areas."),
        ("Does Conservation Halton affect Waterdown projects?",
         "Yes, extensively. Grindstone Creek and its tributaries run through Waterdown, and Conservation Halton regulates a wide allowance on both banks. Properties in and near the creek valleys, including much of the Mountain Brow estate area and parts of older Waterdown village, often need CH permits for hardscape, grading, or tree removal. Typical CH review is 6 to 12 weeks."),
        ("What's the permit path for retaining walls in Waterdown?",
         "Waterdown is part of Hamilton, so Hamilton bylaws apply. Retaining walls over 1 metre (3 ft 3 in) exposed height need a Hamilton building permit with engineered drawings. Walls on Escarpment-facing Mountain Brow slopes may also need NEC approval. CH approval is needed for walls within their regulated zone. Typical permit lead time 2 to 8 weeks depending on regulated-agency involvement."),
        ("What soil conditions are typical in Waterdown?",
         "Waterdown sits on glacial till with substantial clay content, particularly in the newer Academy and Summit Park subdivisions. Older village properties often have deeper topsoil over clay subgrade. Mountain Brow estate properties along the Escarpment edge have shallow soil over limestone. Each subgrade type requires specific base depth and drainage handling."),
        ("What does a Waterdown interlock driveway cost?",
         "A 2-car Waterdown interlock driveway (400 to 600 sq ft) with proper 8-inch compacted base, polymeric sand, and edge restraint runs $26,000 to $46,000. Mountain Brow estate properties with premium materials and engineered slope retention commonly run $55,000 to $95,000. New-subdivision homes in Academy and Summit Park often get the core spec; estate work uses premium paver lines and natural stone accents."),
        ("How do drainage needs differ between old and new Waterdown neighbourhoods?",
         "Older Waterdown village has generally-workable grades but older storm infrastructure. Newer subdivisions (Academy, Summit Park, Cranston) were built on heavily-compacted clay subgrades, often with lot-grading plans that must be respected. Post-construction yards in these newer areas very often need drainage augmentation — French drains, swale work, or catch basins — typically $4,500 to $14,000."),
        ("Can you handle estate-scale work on Waterdown Mountain Brow?",
         "Yes. Waterdown Mountain Brow estate properties have some of the most complex landscape projects in the Hamilton area — steep slopes, Escarpment views, mature trees, large lots, and often Conservation Halton or NEC involvement. We regularly deliver projects in the $150,000 to $500,000 range on Mountain Brow including engineered retaining walls, multi-level terraces, pool integrations, and full landscape redesigns."),
        ("How long do Waterdown projects typically take?",
         "Standard Waterdown residential hardscape projects take 1 to 3 weeks on-site. Estate projects on Mountain Brow or rural-residential lots run 4 to 10 weeks. Permit-dependent projects add 4 to 12 weeks of lead time. Our Waterdown schedule books 6 to 10 weeks ahead in peak season. Quoting in winter for spring installation is the recommended path."),
        ("Does the Niagara Escarpment Commission regulate Waterdown properties?",
         "Mountain Brow and properties near the Escarpment edge fall within NEC jurisdiction. NEC Development Permits are required for retaining walls, significant grade changes, and tree removal. Expected review time is 8 to 16 weeks. We handle NEC applications as part of the project scope and adjust design to NEC development criteria when needed."),
        ("What landscape services are most requested in Waterdown?",
         "Top Waterdown requests: (1) full backyard redesigns with patios and fire features on newer-subdivision lots; (2) drainage correction on Academy and Summit Park lots; (3) retaining walls and multi-level terraces on Mountain Brow slopes; (4) front-yard curb appeal upgrades with premium driveways; (5) interlock and natural stone combinations for rural-residential properties."),
        ("Are you licensed and insured for Waterdown projects?",
         "Yes. Seven Stones Landscape carries $5M liability, full WSIB, ICPI certification, Landscape Ontario membership, and authorized installer status for both Unilock and Techo-Bloc. We've worked across Waterdown since 2013. Our workmanship warranty is 5 years on hardscape with lifetime limited paver manufacturer warranties."),
        ("Do you handle rural-residential Waterdown properties with well and septic?",
         "Yes. Rural-residential Waterdown properties off Safari Road and Millgrove Sideroad have specific setbacks for well (30 m from hardscape drainage) and septic field (no hardscape over field, no concentrated drainage to field). We coordinate with well and septic records, confirm setbacks on-site, and adjust design. These checks are part of our pre-quote consultation."),
    ],
    "stoney-creek": [
        ("Which Stoney Creek neighbourhoods do you serve?",
         "We work across all of Stoney Creek: the lakefront neighbourhoods along Lake Ontario (King's Forest, Green Acres); the older village core around King Street; Stoney Creek Mountain including Upper Stoney Creek and Lakelands; Winona and the wine-country east end with its rural-residential estates; Fifty Point and the waterfront along Fifty Road."),
        ("What's unique about Stoney Creek Mountain landscape work?",
         "Stoney Creek Mountain properties along the Escarpment edge — particularly along Ridge Road and the Mountain Brow — fall within Niagara Escarpment Commission jurisdiction. NEC Development Permits are needed for retaining walls, significant grade changes, and tree removal. These projects also often have dramatic views that influence design, and steep slopes that require engineered terracing."),
        ("Do I need a permit in Stoney Creek for a retaining wall?",
         "Stoney Creek is part of Hamilton, so Hamilton bylaws apply: retaining walls over 1 metre (3 ft 3 in) exposed height require a Hamilton building permit with engineered drawings. Mountain-brow properties may also need NEC approval. Conservation Halton regulates Battlefield Creek and Stoney Creek itself — properties along these need CH permits for hardscape and grading."),
        ("What soil conditions are typical in Stoney Creek?",
         "Stoney Creek has three distinct soil zones. Lakefront areas have sandy-to-silty loam with generally good drainage. The older village and Mountain slope have Halton Till clay with significant freeze-thaw movement. Winona and the east end have a mix of clay and gravelly glacial deposits, often with high water table in areas near Stoney Creek and Battlefield Creek."),
        ("What does a Stoney Creek interlock driveway cost?",
         "A 2-car Stoney Creek interlock driveway (400 to 600 sq ft) with proper 8-inch compacted base and polymeric sand typically runs $26,000 to $46,000. Mountain-edge estate properties or lakefront projects with premium pavers and engineered drainage commonly run $45,000 to $85,000. Winona and rural east-end projects with longer driveways scale up from the base cost per square foot."),
        ("Can you work on Stoney Creek lakefront properties?",
         "Yes. Lakefront Stoney Creek properties along King's Forest and Fifty Point require Conservation Halton permits for any hardscape within 30 metres of Lake Ontario's high-water mark. Lakefront work involves erosion protection, drainage daylighting, and native planting. Typical permit review is 6 to 12 weeks. We coordinate Conservation Halton applications and adjust designs to meet shoreline protection criteria."),
        ("Do you handle vineyard and rural-residential work in Winona?",
         "Yes. Winona has a mix of working vineyards, rural estates, and newer subdivisions. Rural-residential properties have wells, septic systems, and wider setback requirements that shape driveway and drainage design. We coordinate with well and septic records, verify setbacks on-site, and build to rural-appropriate standards (longer driveways with proper turn-around, estate-scale retaining walls, integrated landscape lighting)."),
        ("What services are most requested in Stoney Creek?",
         "Top Stoney Creek requests: (1) retaining walls and terraced backyards on Mountain-edge slopes; (2) interlock driveways with decorative banding; (3) pool surrounds on lakefront and estate properties; (4) drainage correction on older Village lots; (5) full backyard redesigns with fire features, outdoor kitchens, and integrated lighting for entertaining."),
        ("How do you handle Stoney Creek Mountain slope work?",
         "Mountain-edge properties often have 10 to 30% slopes. We design engineered multi-tier segmental retaining walls (Allan Block, Unilock Pisa2, Techo-Bloc Mini-Creta for smaller walls; armour stone for larger engineered systems), coordinate geotechnical input when needed, and integrate drainage chimneys behind each wall. Engineered drawings are provided for all walls over 1.2 metres."),
        ("How long do Stoney Creek projects typically take?",
         "Standard Stoney Creek residential projects take 1 to 3 weeks on-site. Slope-work, lakefront, and estate projects run 4 to 10 weeks. Permit-dependent work (NEC, Conservation Halton, building permit) adds 4 to 16 weeks of lead time. Our schedule books 6 to 12 weeks ahead in peak season. Winter quotes for spring installation are the standard path."),
        ("Are you licensed, insured and certified for Stoney Creek work?",
         "Yes. Seven Stones Landscape carries $5M commercial general liability, full WSIB coverage, ICPI certification, Landscape Ontario membership, and authorized installer status for Unilock and Techo-Bloc. Our Stoney Creek project portfolio dates to 2013. Workmanship warranty is 5 years on hardscape with lifetime limited manufacturer warranties on pavers."),
        ("What does the NEC review process look like for Stoney Creek Mountain work?",
         "NEC review starts with a site meeting to determine if the property is within the Area of Development Control. If so, we prepare a Development Permit application including site plan, drawings, drainage plan, and tree retention plan. NEC typically reviews in 8 to 16 weeks. Critical to respect NEC scenic-view protection, tree retention, and drainage-daylighting criteria; compliant designs move through review efficiently."),
    ],
    "milton": [
        ("Which Milton neighbourhoods do you serve?",
         "We work across Milton: the older village core; Scott (one of the largest newer subdivisions); Boyne, Willmott and Ford (the southern expansion neighbourhoods); Coates; Bronte Meadows; and rural-residential properties in Campbellville and the Milton escarpment edge. Milton's rapid growth means most homes are under 15 years old with distinct drainage and grading challenges."),
        ("Why do newer Milton subdivisions often have drainage problems?",
         "Milton's south-end subdivisions (Scott, Boyne, Willmott, Ford) were built on heavy clay subgrade that was compacted by construction equipment. The resulting topsoil layer is shallow and poorly-draining. Combined with flat lot grading that depends on narrow drainage easements, many homes 3 to 10 years old need drainage correction — French drains, swale cutting, catch basins, or extended downspout systems."),
        ("Do I need a permit for landscaping in Milton?",
         "Milton (under Halton Region) requires a building permit for retaining walls over 1 metre exposed height. Driveway paving that alters the municipal curb approach needs a Right-of-Way permit. Milton has a Tree Protection Bylaw covering trees 20 cm+ in diameter — removal requires a permit. Conservation Halton regulates Sixteen Mile Creek and tributaries — affected properties need CH permits for hardscape and grading."),
        ("How does Milton's clay soil affect hardscape installation?",
         "Most Milton lots sit on heavily-compacted clay with poor drainage and significant freeze-thaw movement. We counter this with minimum 8-inch compacted 3/4-clear limestone base under driveways, 6 inches under patios, non-woven geotextile fabric on subgrade, and positive surface drainage away from structures. Shortcut installations fail within 3 to 5 winters on Milton clay."),
        ("What does a Milton interlock driveway typically cost?",
         "A 2-car Milton interlock driveway (400 to 600 sq ft) with properly specified base, polymeric joint sand, and edge restraint runs $26,000 to $46,000. Larger 3-car driveways or estate properties in Campbellville commonly reach $55,000 to $85,000. Premium paver selections (Unilock Artline, Techo-Bloc Borealis) add 15 to 25% to the base cost."),
        ("Can you work within Milton's lot-grading plans?",
         "Yes — this is essential in Milton. Homes built after 2005 have lot-grading certificates on file with the town, and exterior work must not alter the approved grade at property lines. We design drainage additions (swales, French drains, catch basins) within the grading-plan envelope, keeping approved elevations intact. We review the grading plan during site visit so nothing in the quote violates it."),
        ("Does Conservation Halton affect Milton projects?",
         "Yes, for properties along Sixteen Mile Creek, Middle Sixteen, East Sixteen, and tributaries. CH regulates a wide allowance on both banks. Projects involving hardscape, grading, or tree removal within the regulated zone need CH permits (6 to 12 week review). Many Milton properties, particularly in Scott and the older village, fall under these regulations."),
        ("What services are most requested in Milton?",
         "Top Milton requests: (1) drainage correction on newer subdivision lots; (2) backyard redesigns with patio and fire features; (3) front-yard curb appeal upgrades with interlock driveways and walkways; (4) retaining walls on south-end sloped lots; (5) pool surrounds on estate-scale Campbellville properties. Demand for rural-residential property work has grown as Milton expands."),
        ("How do you handle Milton's flat suburban backyards?",
         "Flat Scott, Boyne and Willmott backyards are among the hardest to drain because there's no gravity to work with. We install hidden low-profile swales through planting beds, centrally-placed catch basins piped to side-yard discharge, rear-yard topsoil build-up to create the minimum 2% slope, and extended downspout lines to permitted daylight points. Typical fix runs $6,500 to $15,000."),
        ("How long does a Milton project typically take?",
         "Standard Milton residential hardscape projects take 1 to 3 weeks on-site. Large estate projects in Campbellville or comprehensive drainage-plus-hardscape packages run 4 to 8 weeks. Our Milton schedule books 6 to 12 weeks ahead during peak season. Winter is design and permit phase; installations resume in mid-April once ground is workable."),
        ("Are you licensed, insured and certified for Milton?",
         "Yes. Seven Stones Landscape carries $5M commercial general liability, full WSIB coverage, ICPI (Interlocking Concrete Pavement Institute) certification, Landscape Ontario membership, and authorized installer status for Unilock and Techo-Bloc. Milton project portfolio dates to our founding in 2013. Workmanship warranty is 5 years on hardscape plus lifetime limited manufacturer warranties on pavers."),
        ("Do you handle rural Campbellville and Milton escarpment properties?",
         "Yes. Campbellville and Milton escarpment-edge properties often have wells, septic systems, and Niagara Escarpment Commission implications. We coordinate with well and septic records, verify setbacks, and apply for NEC Development Permits where required. Rural-residential projects typically involve longer driveways, estate-scale retaining walls, and integrated landscape lighting."),
    ],
    "mississauga": [
        ("Which Mississauga neighbourhoods do you serve?",
         "We work across Mississauga: Lorne Park and Mineola (large-lot estates near the lake); Port Credit and Clarkson (lakefront and waterfront properties); Erin Mills and Mississauga Valley (established suburban); Streetsville (historic village); Credit Woodlands; and the newer northern communities including Churchill Meadows, Lisgar and Meadowvale Village. Each area has distinct lot size, soil, and permit profile."),
        ("Do I need a permit for landscaping in Mississauga?",
         "Mississauga requires a building permit for retaining walls over 1 metre exposed height. Mississauga's Tree Protection Bylaw protects private trees 15 cm+ in diameter — removal needs a permit. Road Occupancy Permits apply to work that affects the municipal boulevard or curb cut. Credit Valley Conservation (CVC) regulates properties near the Credit River and tributaries — hardscape or grading in CVC zones needs CVC permits."),
        ("How does Credit Valley Conservation affect Mississauga projects?",
         "Credit Valley Conservation regulates a wide allowance along the Credit River, Cooksville Creek, Little Etobicoke Creek, and all tributaries. Properties within regulated zones need CVC permits for hardscape, grading, and tree removal. Typical CVC review is 6 to 12 weeks. Port Credit, Erindale, Lorne Park, Streetsville, and Credit Woodlands all have significant CVC-regulated areas."),
        ("What soil types are common in Mississauga?",
         "Mississauga sits largely on Halton Till clay with varying sand content. Lakefront areas (Lorne Park, Mineola, Port Credit) often have sandier, better-draining soil. Newer northern communities (Churchill Meadows, Lisgar, Meadowvale Village) were built on heavily-compacted clay subgrades that need drainage correction post-construction. Streetsville and older Erin Mills have a mix of clay and deeper topsoil."),
        ("What does a Mississauga interlock driveway cost?",
         "A standard 2-car Mississauga driveway (400 to 600 sq ft) runs $30,000 to $52,000 with proper 8-inch compacted base, polymeric sand, and edge restraint. Lorne Park and Mineola premium installations with high-end pavers (Unilock Artline, Techo-Bloc Borealis), decorative banding, and lighting commonly run $60,000 to $115,000. Port Credit waterfront projects scale similarly."),
        ("Can you work on Mississauga heritage properties?",
         "Yes. Mississauga has Heritage Conservation Districts in Port Credit, Streetsville, Meadowvale Village, and parts of Old Mississauga. Heritage-designated properties need a Heritage Permit before exterior change visible from the street. Typical heritage review is 4 to 10 weeks. We've completed projects compliant with Mississauga heritage guidelines and coordinate with heritage consultants where scope warrants it."),
        ("What are the most requested services in Mississauga?",
         "Top Mississauga requests: (1) premium interlock driveways with decorative inlay for Lorne Park and Mineola estates; (2) backyard redesigns with patios, fire features, and outdoor kitchens; (3) pool surrounds on the many estate properties with in-ground pools; (4) drainage correction on newer Churchill Meadows and Lisgar lots; (5) full front-yard redesigns including natural stone walkways and mature-tree integration."),
        ("How do you handle Mississauga's lot-grading plans?",
         "Mississauga homes built after approximately 2005 have recorded lot-grading plans that must be respected — exterior work cannot alter approved grades at property lines. We review the grading plan during on-site visit and design drainage and hardscape additions within the approved envelope. Churchill Meadows, Lisgar, Meadowvale Village, and East Credit all strictly enforce these requirements."),
        ("Do you install and protect mature trees on Mississauga projects?",
         "Yes. Mississauga has significant mature tree canopy in Lorne Park, Mineola, Credit Woodlands, Erin Mills, and Streetsville. We install tree protection zone (TPZ) fencing per City standards (typically 10× trunk diameter radius), hand-excavate within root zones, use air-spade or hydrovac when digging near significant roots, and avoid soil compaction under canopy. Heritage-scale trees trigger arborist report requirements."),
        ("How long do Mississauga projects typically take?",
         "Standard Mississauga residential hardscape projects take 1 to 3 weeks on-site. Larger estate projects in Lorne Park or Mineola with pools, outdoor kitchens, and multi-level terraces commonly run 4 to 10 weeks. Our Mississauga schedule books 8 to 14 weeks ahead during peak season (April to September). CVC or heritage permit projects add 4 to 12 weeks of lead time."),
        ("Are you licensed, insured and certified for Mississauga work?",
         "Yes. Seven Stones Landscape carries $5M commercial general liability, full WSIB coverage, ICPI (Interlocking Concrete Pavement Institute) certification, Landscape Ontario membership, and authorized installer status for Unilock and Techo-Bloc. Mississauga project portfolio dates back to 2013. Workmanship warranty is 5 years on hardscape plus lifetime limited manufacturer warranties on pavers."),
        ("Can you coordinate pool, fencing, and irrigation work on Mississauga projects?",
         "Yes. Mississauga estate projects often involve multiple trades — pool builders, fence contractors, irrigation specialists, landscape lighting designers, and licensed electricians. We sequence the hardscape to integrate with pool construction, pre-run conduit and irrigation sleeving during base prep, and coordinate the final connections. Our on-site project management keeps the trades sequenced and on-schedule."),
    ],
}


FAQ_PATTERN = re.compile(
    r'\{"@context":"https://schema.org","@type":"FAQPage"'
    r'.*?'
    r'\]\}',
    re.DOTALL,
)


def build_faq_json(city: str, qa_pairs: list[tuple[str, str]]) -> str:
    slug = city
    main_entity = [
        {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a},
        }
        for q, a in qa_pairs
    ]
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": f"https://www.sevenstoneslandscape.ca/service-areas/{slug}/#faq",
        "mainEntityOfPage": {
            "@id": f"https://www.sevenstoneslandscape.ca/service-areas/{slug}/#webpage"
        },
        "mainEntity": main_entity,
    }
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    changed = 0
    for slug, qa in CITY_FAQ.items():
        path = CITIES_DIR / slug / "index.html"
        if not path.exists():
            print(f"[skip] missing: {path}")
            continue
        html = path.read_text(encoding="utf-8")
        new_json = build_faq_json(slug, qa)
        new_html, count = FAQ_PATTERN.subn(new_json, html, count=1)
        if count == 0:
            print(f"[skip] FAQPage pattern not found: {slug}")
            continue
        path.write_text(new_html, encoding="utf-8")
        changed += 1
        print(f"[ok] rewrote FAQ in {slug}")
    print(f"done; {changed} city pages updated")


if __name__ == "__main__":
    main()

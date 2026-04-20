"""Generate new blog posts by cloning the landscaping-cost-ontario template.

Uses the existing template's header/footer but swaps head meta and article body.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "blog" / "landscaping-cost-ontario" / "index.html"
BASE = "https://www.sevenstoneslandscape.ca"

# --- Post definitions ---

POSTS = [
    {
        "slug": "how-long-does-interlock-last-ontario",
        "page_title": "How Long Does Interlock Last in Ontario? Lifespan Guide 2026",
        "meta_description": "How long interlock patios and driveways last in Ontario winters, what shortens lifespan, and when to restore vs replace. ICPI contractor insights.",
        "og_image": "/assets/images/i1.jpg",
        "og_image_alt": "Interlock patio lifespan in Ontario",
        "date_published": "2026-04-15",
        "date_modified": "2026-04-20",
        "short_title": "How Long Does Interlock Last?",
        "h1": "How Long Does Interlock Last in Ontario?",
        "intro_html": """Interlock is one of the longest-lasting hardscape surfaces available in Ontario, but the real lifespan is not set by the paver itself. It is set by the base underneath, the edge restraint, the jointing, and whether the installer accounted for 60+ freeze-thaw cycles and de-icing salt every winter. A properly installed <a href="/services/interlock-patios/">interlock patio or driveway</a> on Halton Till clay or Queenston shale can look structurally identical at year 25 as it did on day one, while a patio installed on 2 inches of limestone screenings can start shifting within two seasons. This guide explains what the paver warranties actually cover, what fails first on Ontario installs, and how <a href="/services/">Seven Stones Landscape</a> builds patios and driveways in Hamilton, Burlington, Oakville, Milton, and Mississauga to last a lifetime.""",
        "toc": [
            ("paver-lifespan", "Paver lifespan vs. install lifespan"),
            ("what-fails-first", "What fails first on Ontario interlock"),
            ("warranty", "Paver warranty vs. workmanship warranty"),
            ("base-and-joints", "Base depth and jointing that survive freeze-thaw"),
            ("salt-and-sealer", "Salt damage, efflorescence, and sealers"),
            ("maintenance", "Maintenance that extends lifespan"),
            ("restore-vs-replace", "Restore vs. replace: how to tell"),
            ("conclusion", "How to get a long-lasting install"),
        ],
        "body_html": """<figure class="blog-featured-image">
  <img src="/assets/images/i1.jpg" alt="Interlock patio installation Hamilton Ontario Seven Stones Landscape" width="2048" height="1536" loading="eager" decoding="async" />
</figure>

<h2 id="paver-lifespan">Paver lifespan vs. install lifespan</h2>
<p>A concrete interlocking paver manufactured by <strong>Unilock</strong> or <strong>Techo-Bloc</strong> is a dense, high-PSI concrete unit with a service life well over 30 years under normal residential use. The paver itself is rarely the failure point in Ontario. The failure point is almost always the install: the compacted base, the edge restraint, the joint sand, and the drainage under the surface. That is why <a href="https://www.icpi.org" rel="noopener noreferrer" target="_blank">ICPI-certified</a> installs come with long workmanship warranties on top of the manufacturer's paver warranty, and why two patios laid with the same Unilock Beacon Hill Flagstone can look completely different at year 10.</p>

<h2 id="what-fails-first">What fails first on Ontario interlock</h2>
<p>In the Golden Horseshoe, the most common patio and driveway failures we diagnose for homeowners in <a href="/service-areas/hamilton/">Hamilton</a>, <a href="/service-areas/burlington/">Burlington</a>, and <a href="/service-areas/oakville/">Oakville</a> are:</p>
<ul>
  <li><strong>Base settlement.</strong> A 2-inch screenings base on clay subgrade will frost-heave, pump out fines, and leave pavers sitting in low spots. A 6-inch compacted 3/4-clear stone base will not.</li>
  <li><strong>Edge restraint failure.</strong> Plastic edge restraints installed without 10-inch spikes driven into compacted base pop loose after one freeze-thaw season, and then the entire perimeter starts to spread.</li>
  <li><strong>Joint sand loss.</strong> Regular masonry sand washes out in rain and under pressure washing. Polymeric sand locks the joints and resists weeds and insects.</li>
  <li><strong>Subsurface water.</strong> Missing geotextile between subgrade and base, no drainage chimney, or a patio sloped toward the house all trap water where it causes heaving.</li>
</ul>
<p>None of these are caused by the paver. All of them are caused by how the contractor prepared the site.</p>

<h2 id="warranty">Paver warranty vs. workmanship warranty</h2>
<p>Most homeowners do not realise that every interlock install carries two separate warranties:</p>
<ul>
  <li><strong>Manufacturer warranty</strong> (paver only): covers structural integrity of the paver itself. <a href="https://commercial.unilock.com/" rel="noopener noreferrer" target="_blank">Unilock's</a> residential lifetime warranty covers the paver, not the base or workmanship. <a href="https://www.techo-bloc.com/" rel="noopener noreferrer" target="_blank">Techo-Bloc</a> offers similar coverage on its residential lines.</li>
  <li><strong>Workmanship warranty</strong> (installer): covers base settlement, edge failure, and joint issues caused by the install. Seven Stones Landscape provides a 5-year workmanship warranty in writing on every <a href="/services/interlock-patios/">interlock patio</a> and <a href="/services/concrete/driveways/">driveway</a> we build.</li>
</ul>
<p>If a contractor cannot produce a written workmanship warranty, the paver warranty alone will not help you when the base settles in year three.</p>

<h2 id="base-and-joints">Base depth and jointing that survive freeze-thaw</h2>
<p>Ontario's 60+ annual freeze-thaw cycles are what kills shortcuts. Every paver install we do for a patio, walkway, or driveway follows these minimums:</p>
<ul>
  <li><strong>Excavation:</strong> 10-12 inches on residential patios, 14+ inches on driveways to accommodate the 6-inch 3/4-clear base plus bedding and paver thickness.</li>
  <li><strong>Geotextile:</strong> Mirafi 140N or equivalent non-woven geotextile between subgrade and base on all clay and silty-clay soils, which covers most of Hamilton, Burlington, Oakville, Milton, and Mississauga.</li>
  <li><strong>Base:</strong> 6 inches of 3/4-clear stone, compacted in 2-inch lifts with a reversible-plate compactor.</li>
  <li><strong>Bedding:</strong> 1 inch of HPB (high-performance bedding) or concrete sand, screeded level.</li>
  <li><strong>Edge restraint:</strong> Aluminium or 3/8-inch fiberglass-reinforced PVC, spiked 10 inches into compacted base at 12-inch centres.</li>
  <li><strong>Jointing:</strong> Polymeric sand swept into joints, activated per manufacturer directions, re-topped after first rain if needed.</li>
</ul>
<p>These specs come straight from ICPI installation guidelines. Anything less is a shortcut that shows up in year 3 to 7.</p>

<h2 id="salt-and-sealer">Salt damage, efflorescence, and sealers</h2>
<p>Road salt does not typically destroy Unilock or Techo-Bloc pavers the way it attacks cast concrete, because the pavers are manufactured at much higher PSI and lower water-to-cement ratios. However, salt does accelerate surface wear and encourages efflorescence in the first 1-2 seasons. Two things help:</p>
<ul>
  <li><strong>Use alternatives when you can.</strong> Calcium chloride is gentler than rock salt; sand provides traction with no corrosion risk.</li>
  <li><strong>Seal at year 1-2.</strong> A penetrating sealer from the paver manufacturer resists staining and stabilises the polymeric sand. Re-seal every 3-5 years for high-traffic driveways.</li>
</ul>
<p>For more on how salt behaves on adjacent concrete surfaces, see our guide on <a href="/blog/salt-damage-concrete-driveways-ontario/">salt damage on Ontario concrete driveways</a>.</p>

<h2 id="maintenance">Maintenance that extends lifespan</h2>
<p>Interlock is low maintenance, not no maintenance. To keep a patio or driveway looking sharp and structurally tight well past 25 years:</p>
<ul>
  <li><strong>Sweep and rinse</strong> monthly during the growing season.</li>
  <li><strong>Polymeric sand top-up</strong> every 3-5 years, or sooner if you see open joints.</li>
  <li><strong>Spot weed control</strong> on any joint gaps before they expand.</li>
  <li><strong>Check edges</strong> each spring - edge restraint popping up is the earliest sign of freeze-thaw damage and is cheap to fix early.</li>
  <li><strong>Lift-and-relay</strong> the one or two pavers that settle after 10-15 years rather than leaving a trip hazard.</li>
</ul>
<p>If you already see shifting pavers, open joints, or sunken areas, our <a href="/solutions/interlock-repair/">interlock repair</a> team diagnoses the base before doing any cosmetic work - because resetting pavers on a failed base is a one-season fix.</p>

<h2 id="restore-vs-replace">Restore vs. replace: how to tell</h2>
<p>A properly built patio or driveway rarely needs full replacement. What it may need is a lift-and-relay, a base correction, and new polymeric sand. Here is how we triage jobs for homeowners in Hamilton, Burlington, and Oakville:</p>
<table>
  <thead>
    <tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
  </thead>
  <tbody>
    <tr><td>Isolated sunken pavers</td><td>Local bedding settlement</td><td>Lift and relay affected section</td></tr>
    <tr><td>Large dip across 1/4 of the patio</td><td>Base failure or drainage issue</td><td>Full lift, rebuild base, reinstall pavers</td></tr>
    <tr><td>Pavers spreading at edge</td><td>Edge restraint failed</td><td>Replace edge restraint, re-sand joints</td></tr>
    <tr><td>Open joints, weeds</td><td>Sand washout</td><td>Polymeric sand top-up</td></tr>
    <tr><td>Paver surface crumbling</td><td>Rare - manufacturer defect</td><td>Claim under paver warranty</td></tr>
  </tbody>
</table>
<p>If the pavers themselves are in good shape, the smart path is almost always to save them and correct the base or edges. That is far cheaper than replacement and keeps the original colour and character of the install.</p>

<h2 id="conclusion">How to get a long-lasting install</h2>
<p>Lifespan comes down to four things: excavation depth, base material, edge restraint, and jointing. Everything else follows from those. Ask any contractor you interview to specify - in writing - the base depth, whether geotextile is included, what edge restraint system they use, and whether polymeric sand is standard. If they cannot answer clearly, they are not installing to ICPI standards and the install will not last.</p>
<p>Seven Stones Landscape has been building ICPI-certified interlock patios and driveways across the Golden Horseshoe since 2013. Every project is backed by a 5-year workmanship warranty on top of the Unilock or Techo-Bloc paver warranty. If you want a patio or driveway that is still structurally tight in year 25, <a href="/contact/">request a free on-site estimate</a> and we will walk through exactly what goes under the surface on your property.</p>""",
        "related_links": [
            ("/blog/unilock-vs-techo-bloc-ontario/", "Unilock vs Techo-Bloc in Ontario"),
            ("/blog/interlock-driveway-cost-hamilton-burlington-oakville/", "Interlock Driveway Cost Guide"),
            ("/blog/stamped-concrete-vs-interlock-ontario/", "Stamped Concrete vs Interlock"),
            ("/solutions/interlock-repair/", "Interlock Repair Services"),
            ("/solutions/patio-sinking/", "Patio Sinking Repair"),
        ],
    },
    {
        "slug": "retaining-wall-cost-hamilton-burlington-oakville",
        "page_title": "Retaining Wall Cost Hamilton, Burlington, Oakville 2026 | Seven Stones Landscape",
        "meta_description": "2026 retaining wall cost per foot for Hamilton, Burlington &amp; Oakville. Block, armour stone, engineered options with drainage &amp; permit factors.",
        "og_image": "/assets/images/i3.jpg",
        "og_image_alt": "Retaining wall cost Hamilton Burlington Oakville Ontario",
        "date_published": "2026-04-17",
        "date_modified": "2026-04-20",
        "short_title": "Retaining Wall Cost",
        "h1": "Retaining Wall Cost in Hamilton, Burlington, and Oakville (2026)",
        "intro_html": """Retaining walls are one of the most misquoted items in Ontario landscaping. A quote for a garden border wall and a quote for an engineered segmental block wall holding back 1.5 metres of backyard slope can look superficially similar, but the real cost difference is 5x to 10x per linear foot. This guide breaks down what actually drives the price of a retaining wall in <a href="/service-areas/hamilton/">Hamilton</a>, <a href="/service-areas/burlington/">Burlington</a>, and <a href="/service-areas/oakville/">Oakville</a> - from base preparation on Halton Till clay to <a href="/services/retaining-walls/">geogrid reinforcement</a> requirements above 1 metre - so you can compare apples to apples when you get quotes.""",
        "toc": [
            ("cost-per-foot", "Retaining wall cost per foot in 2026"),
            ("cost-drivers", "What drives retaining wall cost"),
            ("block-vs-armour", "Block vs. armour stone vs. natural stone"),
            ("engineered", "Engineered walls, permits, and the 1-metre rule"),
            ("drainage", "Drainage chimneys and backfill"),
            ("what-to-ask", "What to ask on every quote"),
            ("conclusion", "Getting an accurate wall quote"),
        ],
        "body_html": """<figure class="blog-featured-image">
  <img src="/assets/images/i3.jpg" alt="Retaining wall cost Hamilton Burlington Oakville Ontario" width="2040" height="1536" loading="eager" decoding="async" />
</figure>

<h2 id="cost-per-foot">Retaining wall cost per foot in 2026</h2>
<p>Retaining walls are quoted by the face foot - that is, wall length times exposed height - not by linear foot alone. A 20-foot wall that is 2 feet tall is 40 face feet; a 20-foot wall that is 5 feet tall is 100 face feet. In Hamilton, Burlington, and Oakville, typical 2026 ranges look like this:</p>
<table>
  <thead>
    <tr><th>Wall type</th><th>Typical range (per face foot, installed)</th><th>Common use</th></tr>
  </thead>
  <tbody>
    <tr><td>Garden border wall (under 24 in)</td><td>Lower end</td><td>Planting beds, grade definition</td></tr>
    <tr><td>Segmental block wall (Unilock Pisa2, Techo-Bloc, Allan Block) under 1 m</td><td>Mid range</td><td>Backyard terracing, driveway edges</td></tr>
    <tr><td>Engineered segmental block wall over 1 m</td><td>Higher range (engineering fee added)</td><td>Hillside slopes, major grade changes</td></tr>
    <tr><td>Armour stone wall</td><td>Higher range</td><td>Escarpment properties, premium curb appeal</td></tr>
    <tr><td>Natural limestone / Credit Valley ledge</td><td>Premium</td><td>Heritage Dundas, Ancaster estates</td></tr>
  </tbody>
</table>
<p>We do not publish specific per-foot prices because they genuinely swing with excavation depth, drainage complexity, and site access. A wall on a flat driveway costs less than the same wall behind a house with only wheelbarrow access. Every Seven Stones quote is itemised, so you see the base cost, block cost, drainage cost, and backfill cost separately.</p>

<h2 id="cost-drivers">What drives retaining wall cost</h2>
<p>Six factors move the final number more than anything else:</p>
<ul>
  <li><strong>Wall height.</strong> Every additional course of block adds material, labour, and - above 1 metre - engineering.</li>
  <li><strong>Excavation depth.</strong> Retaining walls need a compacted granular base at least 12 inches below finished grade. On Halton Till clay, we typically excavate an extra 6-12 inches to replace unsuitable subgrade with 3/4-clear.</li>
  <li><strong>Access.</strong> A wall you can reach with a mini-excavator is faster and cheaper than a wall that needs material hand-trucked 40 metres.</li>
  <li><strong>Material choice.</strong> Standard Allan Block is the most affordable engineered option. <a href="https://commercial.unilock.com/" rel="noopener noreferrer" target="_blank">Unilock</a> Pisa2 and <a href="https://www.techo-bloc.com/" rel="noopener noreferrer" target="_blank">Techo-Bloc</a> Mini-Creta are mid-range. Armour stone and Wiarton flagstone are premium.</li>
  <li><strong>Drainage.</strong> A proper drainage chimney with 3/4-clear stone, Mirafi filter fabric, and perforated pipe adds cost but prevents the most common reason walls fail.</li>
  <li><strong>Geogrid reinforcement.</strong> Walls over 1 metre must include geogrid layers tied back into compacted fill. This is non-negotiable under Ontario Building Code for walls over 1 m.</li>
</ul>

<h2 id="block-vs-armour">Block vs. armour stone vs. natural stone</h2>
<p>The three material families we install all solve the same problem - holding back grade - but they live in different price and style categories.</p>
<ul>
  <li><strong>Segmental block</strong> (Unilock Pisa2, Techo-Bloc Mini-Creta, Allan Block): engineered for retaining, straight or curved, excellent warranty, consistent size. This is the most cost-effective structural wall. Ideal for <a href="/service-areas/milton/">Milton</a> subdivisions and <a href="/service-areas/oakville/">Oakville</a> terracing.</li>
  <li><strong>Armour stone:</strong> large, irregular granite or limestone blocks set by machine. Rustic, permanent, heavy curb-appeal statement. Common on <a href="/service-areas/waterdown/">Waterdown</a> and <a href="/service-areas/dundas/">Dundas</a> Escarpment properties.</li>
  <li><strong>Natural stone (Wiarton, Indiana limestone):</strong> quarried flagstone or ledge stone laid traditionally. Highest aesthetic, highest labour. Suited to heritage Dundas and estate Ancaster projects.</li>
</ul>

<h2 id="engineered">Engineered walls, permits, and the 1-metre rule</h2>
<p>Ontario Building Code requires that any retaining wall over 1 metre from finished grade at the base to finished grade at the top be engineered. That means:</p>
<ul>
  <li>Sealed drawings from a professional engineer specifying block system, geogrid spacing, and drainage.</li>
  <li>Geogrid tiebacks embedded in compacted granular fill, typically every 2 courses.</li>
  <li>A building permit from the municipality (Hamilton, Burlington, Oakville, Milton, or Mississauga), and on certain properties additional review from <a href="https://www.conservationhalton.ca/" rel="noopener noreferrer" target="_blank">Conservation Halton</a>, <a href="https://cvc.ca/" rel="noopener noreferrer" target="_blank">Credit Valley Conservation</a>, <a href="https://conservationhamilton.ca/" rel="noopener noreferrer" target="_blank">Hamilton Conservation Authority</a>, or the <a href="https://escarpment.org/" rel="noopener noreferrer" target="_blank">Niagara Escarpment Commission</a>.</li>
</ul>
<p>See our detailed guide on <a href="/blog/retaining-wall-permits-hamilton-burlington-oakville/">retaining wall permits in Hamilton, Burlington, and Oakville</a> for the municipal specifics. Engineering fees are additional to the wall install cost, but they are mandatory - and a contractor who offers to build a 1.2-metre wall without engineering is either ignorant of the code or willing to leave you holding the liability.</p>

<h2 id="drainage">Drainage chimneys and backfill</h2>
<p>The single most common reason retaining walls in Ontario fail is water pressure building up behind the wall through frost-heave seasons. A proper drainage system includes:</p>
<ul>
  <li>Mirafi 140N geotextile wrapping 3/4-clear stone behind the wall (the drainage chimney).</li>
  <li>A 4-inch perforated pipe (weeping tile) at the base, daylighted to a low point or connected to a storm-safe outlet.</li>
  <li>Compacted granular fill in lifts between geogrid layers, never topsoil or clay.</li>
  <li>Finished grade above sloped away from the wall to shed water.</li>
</ul>
<p>If a quote does not spell out the drainage chimney and backfill spec, ask for it in writing. A wall without proper drainage is a wall waiting to lean.</p>

<h2 id="what-to-ask">What to ask on every quote</h2>
<p>Before signing, every retaining wall quote should answer:</p>
<ul>
  <li>What block system is being used (manufacturer and series)?</li>
  <li>Is the wall over 1 m? If yes, who is the engineer of record and is their fee included?</li>
  <li>What is the excavation depth and the granular base spec?</li>
  <li>Is geogrid included, and at what intervals?</li>
  <li>What drainage system is included (chimney, pipe, daylight point)?</li>
  <li>Is backfill specified as compacted granular or native soil?</li>
  <li>What is the workmanship warranty and what does it cover?</li>
</ul>

<h2 id="conclusion">Getting an accurate wall quote</h2>
<p>Retaining wall cost is not a mystery - it is a sum of base prep, block cost, drainage, backfill, engineering (if over 1 m), and labour. Once you know what each line item covers, comparing quotes becomes straightforward. Seven Stones Landscape builds ICPI-certified segmental block and armour stone walls across Hamilton, Burlington, Oakville, Milton, and Mississauga. Every wall we build is priced in writing, backed by a 5-year workmanship warranty, and engineered where required by code. <a href="/contact/">Request a free on-site estimate</a> and we will measure your site, explain the engineering path, and give you a clear number.</p>""",
        "related_links": [
            ("/blog/retaining-wall-permits-hamilton-burlington-oakville/", "Retaining Wall Permits Guide"),
            ("/services/retaining-walls/", "Retaining Wall Services"),
            ("/blog/landscaping-cost-ontario/", "Ontario Landscaping Cost Guide"),
            ("/service-areas/oakville/retaining-walls/", "Oakville Retaining Walls"),
            ("/service-areas/hamilton/retaining-walls/", "Hamilton Retaining Walls"),
        ],
    },
    {
        "slug": "interlock-maintenance-ontario",
        "page_title": "Interlock Maintenance in Ontario: Polymeric Sand, Sealing &amp; Winter Care",
        "meta_description": "Year-by-year interlock patio &amp; driveway maintenance in Ontario: polymeric sand, sealing, salt damage, weeds, winter care. ICPI contractor guide.",
        "og_image": "/assets/images/i7.jpg",
        "og_image_alt": "Interlock patio maintenance Ontario polymeric sand",
        "date_published": "2026-04-18",
        "date_modified": "2026-04-20",
        "short_title": "Interlock Maintenance Guide",
        "h1": "Interlock Maintenance in Ontario: Sand, Sealing, and Winter Care",
        "intro_html": """Interlock patios and driveways are low-maintenance, but they are not zero-maintenance - especially in Ontario, where 60+ freeze-thaw cycles and winter road salt work on every exposed joint. Skip basic maintenance and an otherwise perfect <a href="/services/interlock-patios/">interlock patio</a> starts shifting, greying, and weeding at year 5 instead of year 25. This guide covers exactly what to do, in what order, and how often, for pavers installed across <a href="/service-areas/hamilton/">Hamilton</a>, <a href="/service-areas/burlington/">Burlington</a>, <a href="/service-areas/oakville/">Oakville</a>, <a href="/service-areas/milton/">Milton</a>, and <a href="/service-areas/mississauga/">Mississauga</a>. Every recommendation matches <a href="https://www.icpi.org" rel="noopener noreferrer" target="_blank">ICPI</a> installation guidance and what Seven Stones Landscape does on its own customer callbacks.""",
        "toc": [
            ("year-one", "Year 1: settle-in and first inspection"),
            ("polymeric-sand", "Polymeric sand top-up cycle"),
            ("sealing", "Sealing: when, what, how often"),
            ("weeds", "Weed control that does not wreck joints"),
            ("winter", "Winter care: shoveling, salt, and alternatives"),
            ("annual-checklist", "Annual spring and fall checklist"),
            ("when-to-call", "When DIY stops and a repair starts"),
            ("conclusion", "Keep your install in year-one shape"),
        ],
        "body_html": """<figure class="blog-featured-image">
  <img src="/assets/images/i7.jpg" alt="Interlock patio maintenance Ontario polymeric sand sealing" width="2048" height="1536" loading="eager" decoding="async" />
</figure>

<h2 id="year-one">Year 1: settle-in and first inspection</h2>
<p>The first year is when the base consolidates and the polymeric sand proves itself. During the first 6-12 months after installation:</p>
<ul>
  <li><strong>Let polymeric sand cure undisturbed</strong> for at least 48 hours after activation - no rain, no hose rinse, no sweeping.</li>
  <li><strong>Re-top joints after first rain.</strong> It is normal for a millimetre or two of polymeric sand to settle into pore spaces. A simple sweep-in re-topping is part of the ICPI-recommended install sequence.</li>
  <li><strong>Do not pressure wash</strong> the first season. High-PSI water strips polymeric sand from joints.</li>
  <li><strong>Inspect edges</strong> after the first spring thaw. If edge restraint spikes have shifted, this is the cheapest time to correct them.</li>
</ul>
<p>If your contractor does not return for a 6-month walkthrough, you can walk the perimeter yourself: look for open joints, edge lift, and any settled pavers. Seven Stones Landscape books a free 6-month inspection with every patio and driveway we install.</p>

<h2 id="polymeric-sand">Polymeric sand top-up cycle</h2>
<p>Polymeric sand is the single most important wear item on an interlock install. It locks joints, resists weeds and insects, and prevents water intrusion into the bedding layer. It also breaks down gradually under UV and freeze-thaw, especially on driveways and high-traffic patios.</p>
<ul>
  <li><strong>Inspect annually</strong> every spring. Run your fingers along joints. If sand is more than 3 mm below paver chamfer, it is time to top up.</li>
  <li><strong>Full re-sand</strong> every 3-5 years on residential patios, 2-4 years on driveways with heavier use.</li>
  <li><strong>Product choice:</strong> use the same brand as your installer applied, or a premium brand-compatible polymeric like Alliance Gator SuperSand Bond or Techniseal HP NextGel. Cheap polymeric haze on the paver surface is the most common mistake.</li>
  <li><strong>Install conditions:</strong> dry pavers, 0 to 80% humidity, no rain within 2 hours of activation. Early morning in late spring is ideal in Ontario.</li>
</ul>
<p>If joints are very open or weedy, do not just re-top - sweep out the old sand first, power-wash joints to 1.5 inch depth, let pavers dry completely, then install fresh polymeric sand per manufacturer directions.</p>

<h2 id="sealing">Sealing: when, what, how often</h2>
<p>Sealers are optional but worth considering on:</p>
<ul>
  <li>Driveways exposed to road salt and vehicle fluids.</li>
  <li>Pool surrounds where chlorinated water splashes.</li>
  <li>Patios where owners want deeper colour saturation (<em>wet look</em>).</li>
</ul>
<p>Guidance for Ontario installs:</p>
<ul>
  <li><strong>Wait 12 months</strong> after install before sealing so efflorescence can complete its first cycle.</li>
  <li><strong>Use a penetrating sealer</strong> matched to your paver manufacturer. Film-forming sealers look good at year 1 and look terrible at year 3 when they yellow or peel.</li>
  <li><strong>Re-seal</strong> every 3-5 years on driveways, every 5-7 years on patios, based on how water beads on the surface.</li>
  <li><strong>Apply clean and dry.</strong> Pavers must be clean and moisture-free; a bad seal traps dirt and moisture under a glossy layer.</li>
</ul>
<p>Skipping sealer does not shorten paver life. It can shorten the aesthetic life - colours soften with UV, and deep reds especially benefit from a sealer at year 1-2.</p>

<h2 id="weeds">Weed control that does not wreck joints</h2>
<p>Weeds grow in wind-blown dust deposited on top of polymeric sand - they do not actually root in the base. That means the goal is to:</p>
<ul>
  <li><strong>Sweep debris off the surface</strong> so weed seeds have nowhere to germinate.</li>
  <li><strong>Spot-treat</strong> any weeds that appear with horticultural vinegar or a targeted herbicide approved for paver joints. Avoid boiling water (expands joints) and flame weeders (can scorch paver surface).</li>
  <li><strong>Re-sand</strong> at the first sign of open joints rather than waiting.</li>
</ul>
<p>A fully sanded joint simply has no room for a weed to take hold. Chronic weeding means your polymeric sand is due for a full refresh.</p>

<h2 id="winter">Winter care: shoveling, salt, and alternatives</h2>
<p>Ontario winters are the hardest test your interlock will face. Rules:</p>
<ul>
  <li><strong>Shovel with a plastic or rubber-edged shovel.</strong> Metal shovels chip paver edges and chamfers over time.</li>
  <li><strong>Skip rock salt (sodium chloride)</strong> if you can. It is the most corrosive option for the adjacent concrete surfaces and for any metal edge restraints.</li>
  <li><strong>Calcium chloride or potassium chloride</strong> are gentler and work at lower temperatures.</li>
  <li><strong>Sand for traction</strong> is harmless to the paver but should be swept up in spring before it abrades the surface underfoot.</li>
  <li><strong>Never chip ice off pavers</strong> with a metal bar - you will spall the paver surface.</li>
</ul>
<p>If you have a heated driveway or use a snowblower, set the auger 1/4 inch higher on interlock than on concrete to avoid scraping the surface.</p>

<h2 id="annual-checklist">Annual spring and fall checklist</h2>
<p>A quick twice-a-year walk saves large repair bills later:</p>
<ul>
  <li><strong>Spring:</strong> inspect edges, re-top polymeric sand on open joints, spot-treat early weeds, check that drainage points daylight freely.</li>
  <li><strong>Fall:</strong> deep sweep and rinse, check pool surrounds for any pavers lifted by root pressure, clean polymeric sand dust off paver surface before the first freeze.</li>
  <li><strong>Every 3-5 years:</strong> full polymeric re-sand and, if sealed, re-seal.</li>
</ul>

<h2 id="when-to-call">When DIY stops and a repair starts</h2>
<p>Some maintenance tasks are DIY-friendly. Others tell you the base is failing and cosmetic work will not help. Call in a contractor when you see:</p>
<ul>
  <li><strong>Large dips or waves</strong> in the paver surface - base is settling.</li>
  <li><strong>Pavers spreading outward</strong> at the edge - edge restraint has failed.</li>
  <li><strong>Water pooling</strong> or running toward the house - drainage or slope has shifted.</li>
  <li><strong>Joint sand disappearing every season</strong> - water is moving under the surface.</li>
</ul>
<p>For any of these, our <a href="/solutions/interlock-repair/">interlock repair</a> team diagnoses the base before any cosmetic re-sanding. See also our guides to <a href="/solutions/patio-sinking/">patio sinking repair</a> and <a href="/solutions/uneven-interlock/">uneven interlock</a> for symptom-specific detail.</p>

<h2 id="conclusion">Keep your install in year-one shape</h2>
<p>Interlock maintenance is mostly annual sweeping, watchful joints, and one polymeric re-sand every 3-5 years. Do that, and your patio or driveway will look structurally identical at year 25 as it did the week it was laid. Let it slide, and year 5 is when you start seeing shifting, weeding, and greying that costs real money to reverse. If you want your install walked through once with a contractor who built it to ICPI specs, Seven Stones Landscape offers free maintenance inspections to homeowners across Hamilton, Burlington, Oakville, Milton, and Mississauga. <a href="/contact/">Book yours today</a>.</p>""",
        "related_links": [
            ("/blog/how-long-does-interlock-last-ontario/", "How Long Does Interlock Last?"),
            ("/blog/unilock-vs-techo-bloc-ontario/", "Unilock vs Techo-Bloc in Ontario"),
            ("/solutions/interlock-repair/", "Interlock Repair"),
            ("/solutions/patio-sinking/", "Patio Sinking Repair"),
            ("/solutions/uneven-interlock/", "Uneven Interlock Fixes"),
        ],
    },
]


# --- Template manipulation ---

def load_template():
    return TEMPLATE.read_text(encoding="utf-8")


def build_page(template, post):
    slug = post["slug"]
    url = f"{BASE}/blog/{slug}/"
    og_image_abs = f"{BASE}{post['og_image']}"

    # Build article JSON-LD
    article_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post["h1"],
        "description": post["meta_description"].replace("&amp;", "&"),
        "image": {
            "@type": "ImageObject",
            "url": og_image_abs,
            "width": 800,
            "height": 500,
        },
        "author": {"@id": f"{BASE}/#business"},
        "publisher": {"@id": f"{BASE}/#business"},
        "datePublished": post["date_published"],
        "dateModified": post["date_modified"],
        "url": url,
    }
    article_ld_str = json.dumps(article_ld, ensure_ascii=False, separators=(",", ":"))

    # Build breadcrumb JSON-LD
    breadcrumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE}/blog/"},
            {"@type": "ListItem", "position": 3, "name": post["short_title"], "item": url},
        ],
    }
    breadcrumb_ld_str = json.dumps(breadcrumb_ld, ensure_ascii=False, separators=(",", ":"))

    # Swap head section (everything between <title>...</title> and </head>)
    # Simpler: do targeted replacements on the whole file
    text = template

    # Title
    text = text.replace(
        "<title>How Much Landscaping Costs in Ontario 2026 | Seven Stones Landscape</title>",
        f"<title>{post['page_title']}</title>",
        1,
    )

    # Meta description
    text = text.replace(
        '<meta name="description" content="See realistic 2026 landscaping price ranges in Ontario for patios, driveways, sod, retaining walls, and full backyard projects." />',
        f'<meta name="description" content="{post["meta_description"]}" />',
        1,
    )

    # Canonical
    text = text.replace(
        '<link rel="canonical" href="https://www.sevenstoneslandscape.ca/blog/landscaping-cost-ontario/" />',
        f'<link rel="canonical" href="{url}" />',
        1,
    )

    # og:title
    text = text.replace(
        '<meta property="og:title" content="How Much Landscaping Costs in Ontario 2026 | Seven Stones Landscape" />',
        f'<meta property="og:title" content="{post["page_title"]}" />',
        1,
    )

    # og:description
    text = text.replace(
        '<meta property="og:description" content="See realistic 2026 landscaping price ranges in Ontario for patios, driveways, sod, retaining walls, and full backyard projects." />',
        f'<meta property="og:description" content="{post["meta_description"]}" />',
        1,
    )

    # og:url
    text = text.replace(
        '<meta property="og:url" content="https://www.sevenstoneslandscape.ca/blog/landscaping-cost-ontario/" />',
        f'<meta property="og:url" content="{url}" />',
        1,
    )

    # og:image
    text = text.replace(
        '<meta property="og:image" content="https://www.sevenstoneslandscape.ca/assets/images/our-process.jpg" />',
        f'<meta property="og:image" content="{og_image_abs}" />',
        1,
    )

    # og:image:alt
    text = text.replace(
        '<meta property="og:image:alt" content="Landscaping and hardscaping project - Ontario cost guide" />',
        f'<meta property="og:image:alt" content="{post["og_image_alt"]}" />',
        1,
    )

    # twitter:title
    text = text.replace(
        '<meta name="twitter:title" content="How Much Landscaping Costs in Ontario (2026)" />',
        f'<meta name="twitter:title" content="{post["page_title"]}" />',
        1,
    )

    # twitter:description
    text = text.replace(
        '<meta name="twitter:description" content="See realistic 2026 landscaping price ranges in Ontario for patios, driveways, sod, retaining walls, and full backyard projects." />',
        f'<meta name="twitter:description" content="{post["meta_description"]}" />',
        1,
    )

    # Replace Article JSON-LD (second ld+json block)
    import re
    # Find the Article JSON-LD specifically (it contains "Article" and "datePublished":"2026-03-01")
    article_pattern = re.compile(
        r'<script type="application/ld\+json">\s*\{"@context":"https://schema\.org","@type":"Article".*?\}\s*</script>',
        re.DOTALL,
    )
    text = article_pattern.sub(
        f'<script type="application/ld+json">\n  {article_ld_str}\n  </script>',
        text,
        count=1,
    )

    # Replace BreadcrumbList JSON-LD
    bc_pattern = re.compile(
        r'<script type="application/ld\+json">\s*\{"@context":"https://schema\.org","@type":"BreadcrumbList".*?\}\s*</script>',
        re.DOTALL,
    )
    text = bc_pattern.sub(
        f'<script type="application/ld+json">\n  {breadcrumb_ld_str}\n  </script>',
        text,
        count=1,
    )

    # Now replace the <article> body between INLINED_HEADER_END and INLINED_FOOTER_START
    toc_li = "\n          ".join(
        f'<li><a href="#{anchor}">{label}</a></li>' for anchor, label in post["toc"]
    )
    related_li = "\n          ".join(
        f'<li><a href="{href}">{label}</a></li>' for href, label in post["related_links"]
    )

    new_body = f"""<!-- INLINED_HEADER_END -->
<div class="blog-post-cta-top">
  <div class="container">
    <div class="blog-post-cta-top-actions">
      <a href="tel:+1 (289) 700-0312" class="btn btn--outline">+1 (289) 700-0312</a>
      <a href="/contact/" class="btn btn--cta">Get a Free Quote</a>
    </div>
  </div>
</div>
<main class="blog-post-main">
  <div class="container">
    <article class="blog-article">
      <header>
        <h1 class="blog-post-title">{post['h1']}</h1>
        <p class="blog-post-meta"><time datetime="{post['date_published']}">{_format_date(post['date_published'])}</time><span class="blog-post-meta-separator">|</span><span>By Seven Stones Landscape</span></p>
        <p class="blog-intro-p">{post['intro_html']}</p>
      </header>

      <nav class="blog-toc" aria-label="Table of contents">
        <p class="blog-toc-title">In this article</p>
        <ul>
          {toc_li}
        </ul>
      </nav>

      <div class="blog-content">
        {post['body_html']}
      </div>


            <section class="blog-related-links" aria-label="Related reading">
        <h2>Related Reading</h2>
        <ul>
          {related_li}
        </ul>
      </section>
<!-- seo-local-links:start -->
      <section class="blog-related-links" aria-label="Related service and area links">
        <h2>Plan Your Project Locally</h2>
        <ul>
          <li><a href="/services/">Landscaping & Hardscaping Services</a></li>
          <li><a href="/service-areas/hamilton/interlock-driveways/">Hamilton Interlock Driveways</a></li>
          <li><a href="/service-areas/hamilton/patio-contractors/">Hamilton Patio Contractor</a></li>
          <li><a href="/service-areas/burlington/interlock-driveways/">Burlington Interlock Driveways</a></li>
          <li><a href="/service-areas/oakville/retaining-walls/">Oakville Retaining Walls</a></li>
          <li><a href="/service-areas/dundas/yard-grading-drainage/">Dundas Yard Grading</a></li>
          <li><a href="/service-areas/hamilton/">Hamilton Service Area</a></li>
          <li><a href="/contact/">Request a Free Quote</a></li>
        </ul>
      </section>
      <!-- seo-local-links:end -->
      <div class="blog-cta-bottom">
        <a href="/contact/" class="btn btn--cta">Get a Free Quote</a>
      </div>
    </article>
  </div>
</main>
"""

    body_pattern = re.compile(
        r"<!-- INLINED_HEADER_END -->.*?</main>\s*",
        re.DOTALL,
    )
    text = body_pattern.sub(new_body, text, count=1)
    return text


def _format_date(iso):
    from datetime import date
    d = date.fromisoformat(iso)
    return f"{d.strftime('%B')} {d.day}, {d.year}"


def main():
    template = load_template()
    for post in POSTS:
        out_dir = ROOT / "blog" / post["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / "index.html"
        html = build_page(template, post)
        out_file.write_text(html, encoding="utf-8")
        print(f"Wrote {out_file.relative_to(ROOT).as_posix()} ({len(html)} bytes)")


if __name__ == "__main__":
    main()

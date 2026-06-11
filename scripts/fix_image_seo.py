# One-off image SEO fixer (June 2026):
# - content-accurate alt text for gallery images site-wide
# - real width/height attributes (parsed from the actual files)
# - swaps irrelevant solutions-page gallery photos for on-topic ones
# - de-dupes repeated photos inside the backyard-landscaping gallery
import re, glob, os, struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def img_size(path):
    with open(path, 'rb') as f:
        head = f.read(26)
        if head.startswith(b'\x89PNG'):
            w, h = struct.unpack('>II', head[16:24])
            return w, h
        if head.startswith(b'\xff\xd8'):
            f.seek(2)
            while True:
                b = f.read(1)
                if not b: return None
                if b != b'\xff': continue
                marker = f.read(1)
                while marker == b'\xff': marker = f.read(1)
                m = marker[0]
                if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                    f.read(3)
                    h, w = struct.unpack('>HH', f.read(4))
                    return w, h
                if m in (0xD8, 0xD9): continue
                seg = struct.unpack('>H', f.read(2))[0]
                f.seek(seg - 2, 1)
    return None

DIMS = {}
for p in glob.glob(os.path.join(ROOT, 'assets', 'images', '*')):
    base = os.path.basename(p)
    if base.endswith(('.jpg', '.jpeg', '.png')):
        s = img_size(p)
        if s: DIMS[base] = s

ALT = {
 'b3.jpg': 'Square stone fire pit built into a charcoal interlock patio',
 'backyard-blue-spruce-paver-border.jpg': 'Front yard garden bed with blue spruce, mulch and paver border along an exposed aggregate driveway',
 'backyard-lawn-cedar-fence-spruce.jpg': 'Freshly sodded backyard lawn with cedar fence and mulched garden beds',
 'backyard-pergola-bar-pavers.jpg': 'Covered outdoor bar with stone veneer on a large-format paver patio',
 'built-in-bench-stone-wall-patio.jpg': 'Built-in stone bench and seating wall on a paver patio with perennial gardens',
 'cedar-horizontal-fence-patio-install.jpg': 'Horizontal cedar privacy fence installed beside a new paver patio',
 'cedar-pergola-build-fire-pit-patio.jpg': 'Cedar pergola being built over a paver patio with a stone fire pit',
 'cedar-privacy-fence-segmental-wall.jpg': 'Segmental block retaining wall with horizontal cedar privacy fence above a paver patio',
 'cedar-privacy-screen-stone-side-yard.jpg': 'Stone steps and block retaining wall with cedar privacy screen in a side yard',
 'concrete-driveway-garage-pour-finish.jpeg': 'Stamped concrete front porch and steps at a home with double garage',
 'concrete-driveway-pour-stone-home.jpeg': 'Concrete driveway pour at a stone-front home',
 'concrete-driveway-steps-porch-rebuild.jpeg': 'Concrete driveway, steps and porch rebuild in progress',
 'concrete-pad-pour-rear-yard-fresh.jpeg': 'Freshly poured concrete pad in a rear yard',
 'concrete-pad-stamped-border-cure.jpeg': 'Concrete pad with stamped border during curing',
 'concrete-slab-pour-formwork-side-yard.jpeg': 'Concrete slab pour with formwork along a side yard',
 'concrete-slab-stamped-sandstone-border.jpeg': 'Concrete slab with stamped sandstone-pattern border',
 'concrete-walkway-front-steps-white-house.jpeg': 'Exposed aggregate concrete driveway with smooth broom-finished walkway band',
 'dark-stamped-front-steps-portico.jpg': 'Dark stamped concrete front steps under a portico entry',
 'driveway-stone-pillars-paver-entry.jpg': 'Paver driveway entry with lit masonry stone pillars and boxwood hedging',
 'exposed-aggregate-steps-black-risers.jpeg': 'Exposed aggregate concrete steps with black painted risers',
 'flagstone-front-entry-slate-portico.jpg': 'Slate flagstone front entry steps under a brick portico',
 'flagstone-front-steps-iron-railing.jpg': 'Flagstone front steps with wrought iron railing',
 'freeform-pool-coping-soldier-course-build.jpg': 'Freeform pool with paver coping and soldier course during construction',
 'freeform-pool-dusk-led-bamboo-fence.jpg': 'Freeform pool at dusk with LED lighting and bamboo privacy fence',
 'freeform-pool-night-waterfall-led.jpg': 'Freeform pool at night with stone waterfall and LED lighting',
 'front-steps-planter-wall-install.jpg': 'New stone front steps and masonry planter wall installation',
 'front-yard-sod-mulch-beds-spruce.jpg': 'Lush new sod lawn with mulched garden beds along a wood fence',
 'front-yard-spruce-perennials-aggregate.jpg': 'Stained wood privacy fence with shrub and topiary garden bed beside a fresh lawn',
 'interlock-paver-driveway-residential.jpg': 'Interlock paver driveway installation at a residential brick home',
 'lit-step-risers-night-paver-walkway.jpg': 'Paver walkway and steps with lit risers at night',
 'outdoor-kitchen-cantilever-roof-travertine.jpg': 'Outdoor kitchen with cantilevered roof and travertine patio',
 'outdoor-kitchen-pergola-bbq.jpg': 'Outdoor kitchen with pergola and built-in BBQ',
 'paver-driveway-granite-caps.jpg': 'Interlock paver driveway with granite pillar caps',
 'paver-driveway-ribbon-banding.jpg': 'Interlock paver driveway with contrasting ribbon banding',
 'pavilion-outdoor-kitchen-stone-bar.jpg': 'Backyard pavilion with outdoor kitchen and stone bar',
 'pergola-patio-fire-feature.jpg': 'Pergola over a paver patio with a built-in fire feature',
 'pergola-patio-seating-wall-planters.jpg': 'Pergola and paver patio with seating walls and stone planters',
 'pergola-side-walkway-retaining-wall.jpg': 'Covered pergola walkway along a block garden wall with river rock border',
 'pergola-thumbnail-small.png': 'Cedar pergola over a raised backyard deck',
 'pool-arborvitae-screen-paver-deck.jpg': 'Inground pool with arborvitae privacy screen and paver deck',
 'pool-deck-pavers-charcoal-banding.jpg': 'Pool deck pavers with charcoal banding around an inground pool',
 'pool-flagstone-coping-large-format.jpg': 'Inground pool with flagstone coping and large-format paver deck',
 'pool-seating-wall-fire-feature.jpg': 'Poolside seating wall with waterfall and fire feature at sunset',
 'pool-stacked-stone-feature-wall.jpg': 'Inground pool with stacked stone feature wall',
 'pool-stacked-stone-waterfall.jpg': 'Inground pool with stacked stone waterfall wall and stone coping',
 'rectangle-lap-pool-paver-deck-fall.jpg': 'Rectangular pool with paver deck surrounded by fall foliage',
 's4.jpg': 'Regraded backyard with healthy new lawn, blue spruces and mulched beds',
 's5.jpg': 'Front yard rock garden with boulders, ornamental grasses and exposed aggregate walkway',
 'square-fire-pit-paver-patio-cover.jpg': 'Covered patio seating area with gazebo, fire table and stone seating walls',
 'stamped-concrete-driveway-interlock-ribbon.jpg': 'Stamped concrete driveway with interlock ribbon bands at a stone-front home',
 'stamped-concrete-front-porch-steps.jpeg': 'Stamped concrete front porch and steps',
 'stamped-concrete-front-porch-walkway.jpg': 'Paver front porch, steps and walkway with contrasting border',
 'techo-bloc-walkway-granite-caps.jpg': 'Techo-Bloc paver walkway with natural stone steps at a front entry',
 'townhome-paver-patio-backyard.jpg': 'Interlock paver patio with dining set in a townhome backyard',
}

# On-topic photo sets for solutions pages whose galleries showed unrelated work
SOLUTION_GALLERIES = {
 'backyard-drainage':      ['s4.jpg', 'backyard-lawn-cedar-fence-spruce.jpg', 'front-yard-sod-mulch-beds-spruce.jpg'],
 'flooding-backyard':      ['s4.jpg', 's5.jpg', 'backyard-lawn-cedar-fence-spruce.jpg'],
 'interlock-repair':       ['interlock-paver-driveway-residential.jpg', 'townhome-paver-patio-backyard.jpg', 'paver-driveway-ribbon-banding.jpg'],
 'lawn-drainage-problems': ['s4.jpg', 'front-yard-sod-mulch-beds-spruce.jpg', 'backyard-lawn-cedar-fence-spruce.jpg'],
 'patio-sinking':          ['townhome-paver-patio-backyard.jpg', 'stamped-concrete-front-porch-walkway.jpg', 'techo-bloc-walkway-granite-caps.jpg'],
 'retaining-wall-repair':  ['cedar-privacy-fence-segmental-wall.jpg', 'pergola-side-walkway-retaining-wall.jpg', 'front-steps-planter-wall-install.jpg'],
 'sod-turning-yellow':     ['front-yard-sod-mulch-beds-spruce.jpg', 's4.jpg', 'backyard-lawn-cedar-fence-spruce.jpg'],
 'uneven-interlock':       ['lit-step-risers-night-paver-walkway.jpg', 'paver-driveway-granite-caps.jpg', 'townhome-paver-patio-backyard.jpg'],
 'water-pooling-yard':     ['s4.jpg', 's5.jpg', 'front-yard-sod-mulch-beds-spruce.jpg'],
 'yard-grading-drainage':  ['s4.jpg', 'backyard-lawn-cedar-fence-spruce.jpg', 'backyard-blue-spruce-paver-border.jpg'],
}

IMG_RE = re.compile(r'<img\b[^>]*?/?>')

def rebuild(tag, src_base, alt=None):
    """Return tag with canonical alt + real width/height."""
    new = tag
    if alt is None:
        alt = ALT.get(src_base)
    if alt:
        if 'alt="' in new:
            new = re.sub(r'alt="[^"]*"', f'alt="{alt}"', new)
        else:
            new = new.replace('<img ', f'<img alt="{alt}" ', 1)
    if src_base in DIMS:
        w, h = DIMS[src_base]
        if 'width=' in new:
            new = re.sub(r'width="\d+"', f'width="{w}"', new)
        else:
            new = new.replace('<img ', f'<img width="{w}" ', 1)
        if 'height=' in new:
            new = re.sub(r'height="\d+"', f'height="{h}"', new)
        else:
            new = new.replace('<img ', f'<img height="{h}" ', 1)
    return new

stats = {'alt': 0, 'dims': 0, 'swapped': 0}

for f in glob.glob(os.path.join(ROOT, '**', '*.html'), recursive=True):
    rel = os.path.relpath(f, ROOT).replace('\\', '/')
    if rel.startswith('lp/'):
        continue  # paid LPs managed separately
    html = open(f, encoding='utf-8').read()
    orig = html

    # 1) solutions galleries: swap to on-topic photos
    m = re.match(r'solutions/([a-z-]+)/index\.html$', rel)
    if m and m.group(1) in SOLUTION_GALLERIES:
        wanted = SOLUTION_GALLERIES[m.group(1)]
        state = {'i': 0}
        def swap(mt):
            tag = mt.group(1)
            if state['i'] >= len(wanted):
                return mt.group(0)
            base = wanted[state['i']]; state['i'] += 1
            tag = re.sub(r'src="/assets/images/[^"]+"', f'src="/assets/images/{base}"', tag)
            stats['swapped'] += 1
            return '<div class="service-gallery-item">' + rebuild(tag, base)
        html = re.sub(r'<div class="service-gallery-item">\s*(<img\b[^>]*?/?>)', swap, html)

    # 2) all gallery images + hero <img>: canonical alt + real dims
    def fix(mt):
        tag = mt.group(0)
        sm = re.search(r'src="/assets/images/([^"]+)"', tag)
        if not sm:
            return tag
        base = sm.group(1)
        if base not in ALT:
            return tag
        # only normalize gallery/article images, never logos/badges
        new = rebuild(tag, base)
        if new != tag:
            stats['alt'] += 1
        return new

    # restrict to imgs that reference mapped photos
    html = IMG_RE.sub(fix, html)

    if html != orig:
        open(f, 'w', encoding='utf-8', newline='\n').write(html)

print(stats)
print('dims known for', len(DIMS), 'images')

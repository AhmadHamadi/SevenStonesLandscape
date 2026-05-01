# Image Rename Plan — pending user approval

The image catalog audit identified 87 image files in `/assets/images/` with generic
names (i1, i2, c1, p4, etc.). For SEO image search, alt-text consistency, and
reusability across pages, every photo should be renamed to a descriptive
kebab-case filename.

**Why this is paused**: renaming touches 200+ HTML references across the site.
Doing it as a one-shot bulk operation has high regression risk. Better done
when you have time to spot-check 5-10 pages visually after.

## Critical findings to address before rename

1. **Heavy duplication**: at least 18 files are byte-equivalent duplicates
   - `s2.jpg` == `s4.jpg` (same front-yard sod photo)
   - `s3.jpg` == `b3.jpg` == `w10.jpg` == `fence1.jpg` (same cedar fence photo, used 3+ ways)
   - `s5.jpg` == `i11.jpg` (same driveway pillars photo)
   - `i2.jpg` == `interlockandpatio.jpg` (same stamped concrete porch)
   - `pool1.jpg` == `p4.jpg` (same dusk freeform pool)
   - `i7.jpg` == `f1.jpg` (same pergola)
   - `i14.jpg` == `f3.jpg` (same lit step risers)
   - `i17.jpg` == `f4.jpg` (same built-in bench)
   - `bench1.jpg` == `i17.jpg`
   - `sod1.jpg` == `s2.jpg`
   - All of `f1` to `f11` series are duplicates of i/p/w/s/b files
   - Recommendation: dedupe to ~50 unique photos, then rename

2. **Wrong-service images already swapped on Milton flagstone + walkway pages**:
   - i7 (pergola), i9 (pool deck) -> our-process.jpg, p6.jpg (real flagstone)

3. **Stock photo flags** (consider replacing with real Seven Stones project shots):
   - `p8.jpg` — generic "stock-style" classic pool with stacked stone waterfall
   - `p10.jpg` — low-res 313x220, looks like stock
   - `w10.jpg` (and its 3 duplicates) — cedar fence with shrubs, stock-feel
   - `w6.png` — 169x112 low-res pergola thumbnail

4. **Low-quality assets** (consider deletion):
   - `w6.png` (169x112)
   - `p1.jpg` (313x220)
   - `wood1.png` (orphan, low-res)

## Recommended descriptive renames (priority subset)

These are the 20 most-used, high-impact photos. Full catalog covers 78 files.

| Current | Proposed name | Why |
|---|---|---|
| `i1.jpg` (used 20x) | `interlock-stamped-concrete-driveway-residential.jpg` | Most-used asset; SEO benefit highest |
| `i2.jpg` (used 18x) | `stamped-concrete-front-porch-interlock-walkway.jpg` | Second most-used |
| `i7.jpg` (used 15x) | `pergola-patio-fire-feature-outdoor-lounge.jpg` | Pergola, NOT flagstone — already swapped on Milton pages |
| `i8.jpg` (used 14x) | `techo-bloc-walkway-granite-step-caps.jpg` | Already used on walkway pages, accurate |
| `i9.jpg` (used 15x) | `pool-deck-pavers-charcoal-banding-install.jpg` | Pool, NOT flagstone — already swapped on Milton flagstone |
| `i11.jpg` (used 8x) | `driveway-stone-pillar-lights-paver-entry.jpg` | Driveway page asset |
| `i12.jpg` (used 6x) | `flagstone-front-steps-slate-iron-railing.jpg` | Real flagstone — perfect for flagstone pages |
| `i14.jpg` (used 8x) | `lit-step-risers-night-paver-walkway.jpg` | Distinct asset |
| `i17.jpg` (used 7x) | `built-in-bench-stone-wall-paver-patio.jpg` | Patio/seating-wall asset |
| `c2.jpeg` (used 5x) | `concrete-walkway-front-steps-white-house.jpeg` | Walkway page asset |
| `c5.jpeg` (used 6x) | `concrete-slab-stamped-sandstone-border.jpeg` | Stamped concrete asset |
| `c6.jpeg` (used 4x) | `concrete-driveway-steps-porch-rebuild.jpeg` | Driveway + steps |
| `c10.jpeg` (used 5x) | `stamped-concrete-front-porch-steps.jpeg` | Stamped patio/porch |
| `p4.jpg` (used 3x) | `freeform-pool-dusk-led-bamboo-fence.jpg` | Pool page hero |
| `p6.jpg` (used 3x) | `pool-flagstone-coping-large-format-deck.jpg` | Real flagstone pool |
| `our-process.jpg` (used 5x) | `flagstone-front-entry-slate-portico.jpg` | Real flagstone — flagstone pages |
| `s2.jpg` (used 5x) | `front-yard-sod-mulch-beds-spruce.jpg` | Sod page asset |
| `s7.jpg` (used 5x) | `front-xeriscape-armour-stone-grasses.jpg` | Front-yard landscaping |
| `s8.jpg` (used 5x) | `front-yard-spruce-perennials-aggregate-driveway.jpg` | Front-yard hero |
| `bbq.jpg` (used 1x) | `outdoor-kitchen-cantilever-roof-travertine.jpg` | Outdoor kitchen asset |

## Recommended deletions (safe — zero references or only duplicates)

```
pool1.jpg        # duplicate of p4.jpg
wood1.png        # orphan, 0 references, low-res
fence1.jpg       # orphan duplicate of w10.jpg
bottom.jpg       # orphan duplicate of p9.jpg
bench1.jpg       # duplicate of i17.jpg
interlockandpatio.jpg  # duplicate of i2.jpg, only 3 references
s3.jpg, s4.jpg, s5.jpg # duplicates of s2/w10/i11
b3.jpg           # duplicate of w10.jpg
c11.jpeg, c12.jpeg, c13.jpeg  # duplicates of c6/c10/c9
f1.jpg through f11.jpg  # all duplicates of i/p/w/s files
```

## Process to execute (when approved)

1. Build a mapping table: `{old_filename: new_filename}` for every rename
2. For each old filename:
   - Grep for all references in `*.html`, `*.css`, `*.xml`, `*.txt`
   - Update each reference to point to new filename
3. Rename the actual file in `/assets/images/`
4. Run a visual spot check on top 10 pages
5. For deletions: only delete after confirming 0 references remain
6. Update sitemap.xml lastmod for all affected HTML pages

Estimated blast radius: ~250 reference updates across ~80 HTML files.

**Until this runs**, the wrong-service image swap on Milton flagstone + walkway
pages is the only image change shipped. Aspect-ratio CSS fix applies site-wide.

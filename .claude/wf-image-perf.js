export const meta = {
  name: 'sevenstones-image-perf',
  description: 'Image SEO + Core Web Vitals polish: fix ImageObject dimensions, LP alt text, CSS hero webp fallbacks, remove orphan logo',
  phases: [
    { title: 'Fix', detail: 'parallel agents: schema dims, LP alts, CSS/perf + orphan cleanup' },
    { title: 'Verify', detail: 'JSON valid, no broken refs, no over-broad changes' },
  ],
}
const ROOT = 'C:/Users/ahmad/OneDrive/Desktop/WEBSITES/SEVENSTONES'
const RULES = `Repo root: ${ROOT}. Surgical only. Do NOT change content text, prices, or copy. Do NOT keyword-stuff. After editing, ensure every JSON-LD block on each changed page still parses as valid JSON. Report exactly what changed per file. Style: commas not em-dashes; visible apostrophes &#x27;, ampersands &amp;.`

phase('Fix')
const fixes = await parallel([
  // 1. ImageObject schema dimensions -> match the real <img> dimensions on the same page
  () => agent(`${RULES}
TASK: ImageObject JSON-LD width/height are placeholders (e.g. 800x500, 1200x800) that do not match the real images. For pages whose Article/ImageObject schema "url" points to an image that ALSO appears as an <img> on the page with real width/height attributes, set the ImageObject "width" and "height" to those real <img> values (integers). If the schema image is not present as an <img> on the page (so real dimensions are unknown), LEAVE IT UNCHANGED rather than guessing. Scope: all blog/*/index.html and any page with an "ImageObject" in JSON-LD. Use Glob/Grep to find ImageObject blocks. Report each file + old->new dimensions, and any left unchanged.`,
    { label:'fix:img-schema-dims', phase:'Fix' }),
  // 2. LP page alt text -> content-accurate per the canonical map
  () => agent(`${RULES}
TASK: The two paid landing pages lp/concrete-driveways-patios-walkways/index.html and lp/interlock-patios-driveways-walkways/index.html have keyword-first alt text that mismatches actual image content (they were skipped by scripts/fix_image_seo.py). FIRST read scripts/fix_image_seo.py to get the canonical, content-accurate alt mapping (ALT dict keyed by image filename). For each <img> on the two LP pages, if the filename has a canonical alt in that map, set alt to the canonical content-accurate value. If a filename is not in the map, write a short alt describing what the file's canonical description implies (do NOT invent a different subject; match the map's intent). Keep alts concise and truthful, not keyword-stacked city lists. Report each image: filename, old alt -> new alt.`,
    { label:'fix:lp-alts', phase:'Fix' }),
  // 3. CSS hero webp fallback + hero preload + orphan logo delete
  () => agent(`${RULES}
TASK (performance):
1. Check whether assets/images/hero.webp exists. If it does, update the 5 CSS files that set background:url('/assets/images/hero.jpg') with NO webp fallback (css/about.css, css/blog.css, css/city-page.css, css/service-page.css, css/services.css) to use image-set() with webp first and jpg fallback, MATCHING the pattern already used in css/styles.css (read styles.css line ~2094 for the exact image-set syntax). If hero.webp does NOT exist, skip and report.
2. In index.html, the hero is preloaded as hero.jpg (<link rel=preload as=image href=/assets/images/hero.jpg fetchpriority=high>). Leave the jpg preload (browsers cannot preload from image-set), but report it as a known limitation.
3. Orphan file: the repo root has sevenstoneslogo.png (~890KB). Confirm via Grep that NO html/css references "sevenstoneslogo.png" anywhere (the live logo is assets/images/logo.png/.webp). If and ONLY if zero references exist, delete sevenstoneslogo.png. Report the reference count and whether deleted.
4. Check if the cwebp tool is available (run "cwebp -version"). If available, list the 8 source images lacking a .webp sibling under assets/images (jpg/jpeg/png with no matching .webp); do NOT convert in this run, just report them as a follow-up list. If cwebp is unavailable, report that webp conversion needs tooling.
Report all actions and findings.`,
    { label:'fix:css-perf-orphan', phase:'Fix' }),
])

phase('Verify')
const verify = await agent(`READ-ONLY. ${RULES}
Validate after the fixes: (1) every JSON-LD block across all **/index.html still parses (report invalid count, must be 0); (2) no <img> on the 2 LP pages has an empty/missing alt; (3) sevenstoneslogo.png is either still referenced or fully removed (no dangling reference); (4) the 5 CSS files either reference hero.webp via image-set or were correctly skipped. Report pass/fail per check with specifics.`,
  { label:'verify', phase:'Verify' })

return { fixes, verify }

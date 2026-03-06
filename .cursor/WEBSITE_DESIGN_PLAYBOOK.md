# Website Design Playbook — SEVENSTONES

Applied from your agents and skills so we're ready for a strong website design. Use this when designing or reviewing the SEVENSTONES site.

---

## 1. Design thinking (frontend-design)

Before changing layout or visuals, lock in:

- **Purpose:** Who uses the site? (Homeowners in Hamilton/Burlington/Oakville looking for hardscaping and landscaping.)
- **Tone:** Pick one direction and commit — e.g. **refined / trust / outdoor** (not generic “corporate”). Options: minimal and premium, organic/natural, editorial, or industrial/utilitarian.
- **Differentiation:** One thing people remember (e.g. “the landscaping company with the clearest process” or “premium materials, no cutting corners”).

Then implement with that direction in mind. Bold minimalism and bold maximalism both work; the important part is being intentional.

---

## 2. Aesthetics (frontend-design)

- **Typography:** Avoid Inter, Roboto, Arial, system defaults. Use a clear pairing: one distinctive display font + one readable body font. Your current DM Serif Display + DM Sans is already a step above generic.
- **Color:** One cohesive palette (e.g. CSS variables). Dominant colors + sharp accents. Avoid purple-on-white clichés and timid, even palettes.
- **Backgrounds & depth:** Prefer atmosphere and depth over flat solids — e.g. light gradients, subtle texture, or grain where it fits the tone. Match the “outdoor / premium” feel.
- **Layout:** Prefer some asymmetry, overlap, or grid-breaking over a single centered-card stack. Use negative space or controlled density intentionally.
- **Motion:** Use animation for high-impact moments (e.g. hero or section reveals, key hovers). Prefer CSS (and `prefers-reduced-motion`) for this HTML site. One strong reveal often beats many small twitches.

Never aim for “generic AI” look: same fonts, same purple gradients, same centered layouts everywhere.

---

## 3. UX & accessibility (ui-ux-pro-max)

**Critical**

- **Contrast:** ≥ 4.5:1 for normal text (already improved on CTA with white + shadow).
- **Focus:** Visible focus rings on all interactive elements (you have `--focus-ring`).
- **Images:** Descriptive `alt` on meaningful images (hero, services, process, gallery).
- **Buttons/links:** Icon-only buttons have `aria-label`; clickable elements have `cursor: pointer` where appropriate.

**Touch & interaction**

- Touch targets ≥ 44×44px on mobile (nav, CTAs, form buttons).
- Buttons disabled or show loading during submit/async.
- Errors shown near the field, in clear language.

**Performance**

- Images: consider WebP, `srcset`, `loading="lazy"` where you already use it.
- Respect `prefers-reduced-motion` for non-essential motion.
- Avoid layout shift (reserve space for async content or images).

**Layout & responsive**

- Viewport meta and readable font size (e.g. ≥ 16px body on mobile).
- No horizontal scroll; manage `z-index` with a simple scale (e.g. 10, 20, 30, 50).

---

## 4. Consistency & system (ui-design-system, theme-factory)

- **Tokens:** Use your existing CSS variables (`--dark`, `--cta`, `--space-*`, `--radius`, etc.) everywhere. Add new tokens instead of one-off values.
- **Spacing:** Stick to the 8pt grid (`--space-xs` through `--space-2xl`) for alignment and rhythm.
- **Theme:** If you want a named “theme” (e.g. from theme-factory), pick one (e.g. Natural/Outdoor or Modern Minimalist) and apply colors/fonts consistently across all pages.

---

## 5. Code & patterns (cc-skill-frontend-patterns, senior-frontend)

- **Semantic HTML:** Sections with headings (h1 → h2 → h3), `aria-labelledby` where it helps, landmarks (header, main, footer, nav).
- **Components:** Reusable pieces (e.g. service card, CTA band, contact strip) with one responsibility and consistent class names.
- **Performance:** Lazy load below-the-fold images; keep critical CSS and hero assets fast.

---

## 6. Quick checklist before calling the design “done”

- [ ] One clear tone and one differentiator for the whole site.
- [ ] Typography: distinctive pairing, no generic system fonts.
- [ ] Color: single palette, dominant + accent, good contrast.
- [ ] Accessibility: contrast, focus, alt text, touch targets, reduced motion.
- [ ] Responsive: no horizontal scroll, readable text, tap-friendly.
- [ ] Motion: intentional (e.g. hero/section reveal), not random.
- [ ] Consistency: same header/footer/CTA pattern, same tokens.
- [ ] SEO: titles, descriptions, schema (you already have these).

---

## Skills and agent referenced

| Source | Use for |
|--------|--------|
| **frontend-design** | Bold aesthetic direction, typography, color, layout, avoiding generic AI look |
| **ui-ux-pro-max** | Accessibility, touch, performance, layout, typography/color rules |
| **cc-skill-frontend-patterns** | Component and code patterns (applicable in spirit to HTML/CSS) |
| **senior-frontend** | Performance, structure, production-ready UI |
| **ui-design-system** | Design tokens, consistency, handoff |
| **theme-factory** | Themed color/font sets if you want a named theme |
| **expert-react-frontend-engineer** (agent) | React-specific; use for any future React work |

You’re set to make design decisions and reviews using these standards.

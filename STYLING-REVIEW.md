# Styling and Code Review

Review of the Seven Stones Landscape site against the project's skills and the Expert React Frontend Engineer agent. Goals: align with design-system and frontend-design guidance, remove generic "AI" aesthetics, reduce emoji/Unicode decoration, and establish a solid base for future pages.

---

## 1. Skills and Agent Alignment

### frontend-design (SKILL.md)

- **Typography**: The skill explicitly warns against Inter, Roboto, Arial, and generic choices. The site used **Inter** (body) and **Plus Jakarta Sans** (display), both very common in AI-generated UIs. **Change**: Use a distinctive display font and a refined body font (e.g. Fraunces or DM Serif Display for headings; Source Sans 3 or similar for body).
- **Color**: Use a cohesive palette with CSS variables and a clear dominant + accent. **Change**: Keep dark/cream base but tighten tokens; consider a landscape-appropriate accent (e.g. stone or green) so the palette feels intentional, not default blue.
- **Motion**: Prefer one well-orchestrated reveal over scattered effects. **Change**: Add staggered `animation-delay` for `.reveal` so sections enter in sequence; replace the scroll-indicator bounce with a subtle pulse or fade.
- **Spatial composition**: Avoid predictable centered stacks. **Change**: Layout is already grid-based; ensure section backgrounds have subtle depth (e.g. very light gradient or texture) so it doesn’t feel flat.
- **Backgrounds**: Add atmosphere and depth. **Change**: Keep hero gradient overlay; add optional subtle noise or gradient on light sections for depth.

### ui-design-system (SKILL.md)

- **Design tokens**: Colors, typography, spacing should be tokenized. **Change**: Expand `:root` with a clear token set (primary, surface, text, accent, spacing scale, radius, shadow). Use an 8pt spacing grid (8, 16, 24, 32, 40, 48, 64, 96).
- **Consistency**: All new pages should use the same tokens and component classes. **Status**: Single `styles.css` and shared partials support this; revamp reinforces tokens.

### theme-factory (SKILL.md)

- **Themes**: Optional use of a preset theme (e.g. Forest Canopy, Botanical Garden) for palette/font ideas. **Change**: Palette and type choices can be inspired by landscape/natural themes without copying a theme verbatim; tokens are defined in CSS for easy future theme swaps.

### cc-skill-frontend-patterns (SKILL.md)

- **Accessibility**: Keyboard navigation, focus management, semantic HTML. **Change**: Add visible `:focus-visible` styles for links and buttons; keep semantic structure (section, nav, header, footer, labels).
- **Composition**: N/A for static HTML; partials already provide reusable header/footer.

### frontend-dev-guidelines (SKILL.md)

- **Styling**: Prefer a single source of truth for styles and tokens. **Status**: One stylesheet and tokens in `:root`; no inline styles.

### Figma (SKILL.md)

- **Design-to-code**: When Figma is used, translate with project tokens and components. **Status**: After this revamp, any Figma-driven work should use the updated tokens and classes.

### Expert React Frontend Engineer (agent)

- **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, etc. **Status**: Already in use.
- **Accessibility**: WCAG, ARIA where needed, keyboard support. **Change**: Focus styles and replacing decorative Unicode with SVG or text where it improves clarity and a11y.
- **No emoji in UI**: Keep interface professional. **Change**: Replace footer/quote Unicode symbols (phone, envelope, map pin, clipboard) with inline SVG or text so the UI is icon-based, not emoji-based. Star characters (&#9733;) for ratings are kept as they denote “stars” semantically.

---

## 2. Findings and Changes Applied

### Typography

- **Before**: `--font-display: 'Plus Jakarta Sans'`, `--font-body: 'Inter'`.
- **After**: `--font-display: 'Fraunces'` (or similar), `--font-body: 'Source Sans 3'`. Font link in `index.html` updated to load the new pair.

### Color tokens

- **Before**: Single blue accent (`#3B82F6`), hard-coded `#64748b` in one place.
- **After**: All colors via variables; optional secondary accent for variety; `section-intro` and similar use `var(--text-muted)` or equivalent.

### Motion

- **Before**: Uniform reveal; scroll indicator with bounce animation.
- **After**: Staggered reveal via `.reveal` + `animation-delay` (e.g. nth-child); scroll indicator uses a subtle opacity or translate animation instead of bounce.

### Focus and a11y

- **Before**: No explicit focus ring.
- **After**: Global `:focus-visible` outline/ring for links and buttons so keyboard users get clear focus.

### Depth and background

- **Before**: Flat cream and dark sections.
- **After**: Optional very subtle gradient or noise on `.section--cream` (or equivalent) so light sections have slight depth without distraction.

### Icons and symbols

- **Before**: Footer and quote section used Unicode (e.g. &#128222;, &#9993;, &#128205;, &#128203); back-to-top used &#8679;.
- **After**: Footer contact and quote perks use inline SVG or text (e.g. “Phone”, “Email”, “Location” or small SVGs). Back-to-top uses an inline SVG arrow. Star ratings remain Unicode stars with appropriate `aria-label`.

### Copy and tone

- **Before**: Mostly professional; no major “vibe” or emoji in copy.
- **After**: No new emoji; keep tone professional and minimal.

---

## 3. File-Level Summary

| File | Changes |
|------|--------|
| `css/styles.css` | New/updated design tokens, typography variables, 8pt spacing, staggered reveal, scroll-indicator animation, focus-visible, optional section background depth. |
| `index.html` | Font preconnect and stylesheet link updated to load Fraunces + Source Sans 3 (or chosen pair). |
| `partials/header.html` | No structural change; relies on updated CSS. |
| `partials/footer.html` | Replace phone/envelope/location Unicode with inline SVG (or text). Back-to-top button: SVG arrow. |
| `index.html` (body) | Quote perks: replace Unicode icons with SVG or text. Reason icons in “Why Us”: keep or replace with SVG for consistency. |

---

## 4. How to Add New Pages

1. Use the same `<head>` pattern: canonical meta, same font link, `/css/styles.css`.
2. Use the same body shell: `data-phone` / `data-email`, `#header-placeholder`, `#footer-placeholder`, `main.js`.
3. Use only token-based classes (e.g. `section`, `section--cream`, `section-title`, `btn`, `container`) so new pages stay on-system.
4. No inline styles; no new one-off colors or fonts.

---

## 5. References

- `.cursor/skills/frontend-design/SKILL.md` – Aesthetic direction, typography, color, motion.
- `.cursor/skills/ui-design-system/SKILL.md` – Design tokens, spacing grid.
- `.cursor/skills/theme-factory/SKILL.md` – Theme ideas (e.g. Forest Canopy, Botanical Garden).
- `.cursor/skills/cc-skill-frontend-patterns/SKILL.md` – Patterns and a11y.
- `.cursor/agents/expert-react-frontend-engineer.md` – Semantic HTML, a11y, professional UI.

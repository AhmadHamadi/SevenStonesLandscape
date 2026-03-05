# Project
Seven Stones Landscape — homepage lead-gen site (Hamilton ON). Goal: phone calls + quote form submissions.

# Stack
Single-file HTML + vanilla CSS + vanilla JS. Google Fonts only. No build step.
Open: `index.html` in browser. Deploy: static host (Netlify/Vercel/cPanel).
Assets: `hero-img.jpg`, logo PNG already in project root.

# Structure
```
SEVENSTONES/
├── index.html          ✅
├── CLAUDE.md           ✅
├── hero-img.jpg        (existing)
└── 67d4a23a...png      (existing logo)
```

# Design Tokens
--dark: #1B2A1F        (dark forest bg)
--dark-alt: #2C2C2C    (charcoal alt)
--cream: #F5F1EB       (warm off-white)
--accent: #4A6741      (forest green)
--stone: #8B7355       (warm stone)
--cta: #C4913A         (warm gold CTA)
--text-dark: #1A1A1A
--text-light: #F5F1EB
--font-display: 'DM Serif Display', serif
--font-body: 'Outfit', sans-serif
Spacing rhythm: 8px base, sections 80–120px desktop / 48–64px mobile

# SEO
Title: Seven Stones Landscape | Hamilton Hardscaping & Landscaping
Meta: Premium hardscaping & landscaping in Hamilton, Burlington & Oakville. Interlock patios, retaining walls, sod & grading. Free quotes — call today.
Keywords: interlock, patio, hardscaping, retaining wall, landscaping, sod, grading, outdoor lighting + 9 cities
Schema: LocalBusiness (HomeAndConstructionBusiness), Service, FAQPage

# Decisions
DM Serif Display + Outfit — editorial premium feel, not generic SaaS — WHY: matches high-end contractor tone
#C4913A gold CTA — warm, earthy, high contrast on dark — WHY: stands out without screaming
Two quote forms — hero (short/above-fold) + section 10 (full) — WHY: capture both quick and deliberate visitors
Image placeholders as styled divs — WHY: no real photos yet, preserves layout density & alt text for SEO
IntersectionObserver for counter + scroll animations — WHY: no-lib perf-safe approach

# Status
✅ CLAUDE.md
✅ index.html — COMPLETE (2580 lines, all 13 sections + JS + 3 JSON-LD schemas)
  ✅ S1 Header/Nav (fixed, mobile hamburger)
  ✅ S2 Hero (bg image, short form, trust badges)
  ✅ S3 Social Proof Bar (animated counters)
  ✅ S4 Services Grid (6 cards)
  ✅ S5 Why Choose Us
  ✅ S6 Process (4 steps)
  ✅ S7 Gallery (5 placeholder slots)
  ✅ S8 Testimonials (6 cards)
  ✅ S9 Service Area (9 cities)
  ✅ S10 Full Quote Form
  ✅ S11 FAQ Accordion (7 Q&A)
  ✅ S12 Final CTA Band
  ✅ S13 Footer
  ✅ JS: nav scroll/mobile, counter anim, scroll-reveal, FAQ accordion, smooth anchors
  ✅ Schema: LocalBusiness, Services ItemList, FAQPage
⬜ Real photos swap-in (replace .gallery-thumb placeholder divs)
⬜ Real phone/email/address fill-in (search [PHONE], [EMAIL])
⬜ Form backend (Netlify Forms / Formspree)
⬜ Social media URLs in footer

# Gotchas
Logo file: 67d4a23a948efd23af1eed5a_SEVEN STONES LANDSCAPE (400 x 200 px) (2)-p-130x130q80.png — spaces in name, use encoded or rename
All [PLACEHOLDER] values must be filled before launch
hero-img.jpg exists — use as hero background

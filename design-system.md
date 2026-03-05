## Design System: Seven Stones Landscape

### Pattern
- **Name:** Trust & Authority + Minimal
- **CTA Placement:** Above fold
- **Sections:** Hero > Features > CTA

### Style
- **Name:** Trust & Authority
- **Keywords:** Certificates/badges displayed, expert credentials, case studies with metrics, before/after comparisons, industry recognition, security badges
- **Best For:** Healthcare/medical landing pages, financial services, enterprise software, premium/luxury products, legal services
- **Performance:** ⚡ Excellent | **Accessibility:** ✓ WCAG AAA

### Colors
| Role | Hex |
|------|-----|
| Primary | #0F172A |
| Secondary | #334155 |
| CTA | #0369A1 |
| Background | #F8FAFC |
| Text | #020617 |

*Notes: Professional blue + neutral grey*

### Typography
- **Heading:** Satoshi
- **Body:** General Sans
- **Mood:** premium, modern, clean, sophisticated, versatile, balanced
- **Best For:** Premium brands, modern agencies, SaaS, portfolios, startups
- **Google Fonts:** https://fonts.google.com/share?selection.family=DM+Sans:wght@400;500;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
```

### Key Effects
Badge hover effects, metric pulse animations, certificate carousel, smooth stat reveal

### Avoid (Anti-patterns)
- Generic content
- No credentials
- AI purple/pink gradients

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px


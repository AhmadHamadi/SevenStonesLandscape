from pathlib import Path
import json

# lightweight targeted upgrades
targets = [
 ('service-areas/milton/flagstone-installation/index.html','Milton flagstone installation projects often fail from weak base depth and poor runoff planning. We build for freeze-thaw durability with excavation, compaction, and material-specific joint strategy. Homeowners in Beaty, Harrison, and Bronte Meadows usually choose limestone or sandstone when they want natural texture with strong curb appeal.'),
 ('service-areas/milton/stone-walkway-installation/index.html','Stone walkway installation in Milton should prioritize slope continuity, edge restraint, and seasonal traction. We design paths around real daily movement and tie-ins at driveways, porches, and patios so the final layout is safe, functional, and visually cohesive.'),
 ('service-areas/burlington/retaining-walls/index.html','Burlington retaining wall performance depends on drainage as much as block or stone choice. We engineer backfill and pressure-release detail to prevent leaning and structural rotation while keeping the finished wall aligned with high-end landscape design goals.'),
 ('service-areas/oakville/retaining-walls/index.html','Oakville retaining wall projects demand both structural reliability and luxury finish quality. We integrate footing prep, drainage layers, and premium material selection so walls remain stable while matching architectural style and outdoor living layouts.'),
 ('service-areas/waterdown/patio-installation/index.html','Waterdown patio installations, especially on new-build lots, benefit from grade verification before base prep. We compare interlock and stamped concrete by maintenance, repair flexibility, and visual style so homeowners choose the right long-term system.'),
 ('solutions/interlock-repair-hamilton/index.html','Hamilton interlock repair requires more than re-sanding. We correct movement by rebuilding weak support zones, stabilizing joints, and restoring slope where runoff contributes to washout and repeated paver displacement.'),
 ('solutions/sinking-steps-repair/index.html','Sinking step repair should address riser consistency, landing slope, and transition safety at the same time. We fix root support failure first, then restore clean finish lines so the entry is both safer and visually improved.'),
 ('solutions/yard-drainage-ontario/index.html','Ontario yard drainage correction works best when runoff is mapped as a system. We adjust grading, collection, and discharge routes so flooding symptoms are solved at source instead of shifting to another zone.')
]

for fp, paragraph in targets:
    p = Path(fp)
    raw = p.read_text(encoding='utf-8')
    marker = '<section class="section section--cream"><div class="container"><h2 class="section-title">Related Services & Pages</h2>'
    add = f'<section class="section"><div class="container"><h2 class="section-title">Detailed Local Guidance</h2><p class="section-intro">{paragraph}</p><p class="section-intro">We align design, structure, and drainage so results stay reliable across seasonal weather cycles in Ontario. Every scope is documented clearly so homeowners can compare options by durability, not just appearance.</p></div></section>'
    if marker in raw and 'Detailed Local Guidance' not in raw:
        raw = raw.replace(marker, add + marker, 1)

    # upgrade image block to 4 images where possible
    if raw.count('<img src=') == 3:
        raw = raw.replace('</div></div></section>\n<section class="section"><div class="container"><h2 class="section-title">Local Expertise (E-E-A-T)</h2>', '<img src="/assets/images/i1.jpg" alt="Seven Stones local project detail image relevant to page service" loading="lazy" style="width:100%;max-width:360px;border-radius:12px;" /></div></div></section>\n<section class="section"><div class="container"><h2 class="section-title">Local Expertise (E-E-A-T)</h2>', 1)

    p.write_text(raw, encoding='utf-8')

print('upgraded intent pages content/images')

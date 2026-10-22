# Painted ground and upright scenery

The current experience uses six original assets generated with the built-in image tool using the user's apple-picking painting as the brushwork and palette reference. They are not paintings by Sohrab Sepehri.

All six assets are saved under `dist/assets/paintings/`, converted using `cwebp -q 93 -m 6` with the generated alpha preserved:

| File | Role |
| --- | --- |
| ground-river.webp | A continuous horizontal garden floor and river, viewed from above |
| orchard-rise.webp | An upright apple tree and the only human figure |
| porch-garden.webp | An upright empty porch, lamp and tea table |
| heron-bank.webp | One heron in rooted reeds and irises |
| willow-rise.webp | A tall willow on the far bank |
| valley-horizon.webp | The distant upright mountain ridge |

The ground starts on XZ and curves through a rounded far bank into the distant ridge as one connected mesh. Ground and valley textures crossblend before the bend, with continuous fog and shared color grading; there is no separate foreground perimeter at their join. Upright paintings rise on XY with their roots and steps meeting the same ground height. The depth buffer, shared projection and soft ground shadows keep the pieces attached to the terrain. No asset is repeated, mirrored or tiled. The single lily, fish, book and boat are painted into the horizontal river surface.

A curved camera path moves along and into the landscape, with changes in elevation and view angle. A critically damped camera rig eases acceleration and braking. The reading distance stays at 20.4 units through the first ten passages, then eases to 21.4 for the ending: one five-percent pullback, with no repeated automatic zooms. Hover is deliberately subdued. Opening the landscape is an explicit user action and has its own wider view, wheel/button zoom and two-axis ground exploration.

The prior tall single-picture version remains as the static WebGL fallback, `unified-world.webp`. Previous artwork and renderers are retained under `.qa/`.

## Final prompts and generated sources

### ground-river

Saved asset: `dist/assets/paintings/ground-river.webp`.

Generation source ID: `01a1634c-8a89-7ae2-9c62-31cea4faa185/exec-d557a1bb-b7ed-49c3-b978-a9d881696bce.png`.

Use case: illustration-story. Create an asset for one cohesive oil-painted landscape in a 3D poetry experience. The reference image supplies BRUSHWORK and PALETTE only. Match its broad, confident, thick impasto strokes, scraped ivory marks, mint and silver-green, deep forest green shadows, occasional vermilion. Avoid tiny photorealistic detail or a polished miniature look. Warm diffuse light comes from upper left. Genuine alpha transparency outside the organic painted silhouette, soft irregular bristle edges, no white or colored backdrop, no frame, text, watermark, fake shadow or floating island.
Asset: a single very WIDE 3:1 continuous HORIZONTAL GROUND texture, viewed DIRECTLY FROM ABOVE, orthographic bird's eye plan. No horizon, sky, standing trees, buildings or people. It will be laid flat on the XZ ground plane in a 3D scene, so absolutely no upright scenic backdrop. Paint a coherent garden-to-river floor across the whole width: left 35% a muted sage orchard floor with earthy patches and a broad ivory stepping-stone path, traveling from left-center toward the center. Right 65% a broad silver-jade river running lengthwise with gently curving banks, underwater stones, flowing paint strokes and scattered low lily pads. The near bank along the bottom is dark moss, roots, low grasses, broken pale stone edges; far bank at top is muted meadow. Place exactly one naturally small white water lily at 70% width, 55% height, one tiny vermilion fish beside it, and one small open ivory book on water at 88% width, 42% height. A single small empty wooden rowboat is pulled into the bank near 52% width, 35% height, seen overhead. All ground connects without gaps. No tall shrubs or trees, no upright architecture, no people, no terrain cliffs, no isolated islands. Feather all four perimeter edges into real transparency, but keep the entire central ground and river filled with opaque paint. Wide aspect 3:1, highest available resolution.

### orchard-rise

Saved asset: `dist/assets/paintings/orchard-rise.webp`.

Generation source ID: `01a1634c-8a89-7ae2-9c62-31cea4faa185/exec-db29f5fd-ac9f-4a75-8b7c-7f8c14fa1a6b.png`.

Use case: illustration-story. Create an asset for one cohesive oil-painted landscape in a 3D poetry experience. The reference image supplies BRUSHWORK and PALETTE only. Match its broad, confident, thick impasto strokes, scraped ivory marks, mint and silver-green, deep forest green shadows, occasional vermilion. Avoid tiny photorealistic detail or a polished miniature look. Warm diffuse light comes from upper left. Genuine alpha transparency outside the organic painted silhouette, soft irregular bristle edges, no white or colored backdrop, no frame, text, watermark, fake shadow or floating island.
Asset: one TALL PORTRAIT 2:3 orchard grove to stand vertically on the ground, front view with subtle three-quarter dimensionality. A full-height mature apple tree with a thick dark twisting trunk, tall branches and airy silver-green canopy. Canopy fills the upper 70%, broad brush marks like the reference, few bright red apples. Exactly ONE person: the ivory-dressed apple-picker seen from behind, reaching upward toward an apple, complete body including feet, standing beside the trunk. Person occupies about 40% of total asset height. All branches and the one figure are one connected painted composition. Show the base of the trunk and roots at the bottom, woman’s feet on the SAME BASELINE as the roots, with only a very thin soft fringe of dark moss and low leaves. Do NOT include a broad ground patch, horizon, mountains, house, other people or any background scenery. Transparent gaps between outer branches and the figure. Tall full silhouette, no cropped crown or feet. Trees must feel upright, lofty, sculptural and airy, not a rectangular landscape.

### porch-garden

Saved asset: `dist/assets/paintings/porch-garden.webp`.

Generation source ID: `01a1634c-8a89-7ae2-9c62-31cea4faa185/exec-ae999c17-81b0-477e-a7c1-e4537c217790.png`.

Use case: illustration-story. Create an asset for one cohesive oil-painted landscape in a 3D poetry experience. The reference image supplies BRUSHWORK and PALETTE only. Match its broad, confident, thick impasto strokes, scraped ivory marks, mint and silver-green, deep forest green shadows, occasional vermilion. Avoid tiny photorealistic detail or a polished miniature look. Warm diffuse light comes from upper left. Genuine alpha transparency outside the organic painted silhouette, soft irregular bristle edges, no white or colored backdrop, no frame, text, watermark, fake shadow or floating island.
Asset: an upright whitewashed Persian garden porch, width:height 4:3, viewed mostly front-on with a visible right side wall. One recessed doorway, a climbing vine with sparse red blossoms, a warm amber hanging lantern on the left wall, and a low wooden tea table with two tiny cups on the porch. Absolutely NO PEOPLE anywhere. White plaster painted in broad buttery ivory and grey-green strokes, dark interior doorway, visible roof edge. Three broad shallow stone steps descend to a clean shared ground baseline at the bottom of the picture. Small rooted irises at one corner and a single clay pot on the other, naturally integrated. Keep all structural parts connected. Ground fringe is only a few soft earthy brushstrokes at the step's foot, no large platform, no isolated island or floating plinth. No mountains, horizon, distant scene, trees behind the house, or canvas rectangle. Genuine transparent space around the complete freestanding silhouette. Composition should work as an upright building on a painted ground plane.

### heron-bank

Saved asset: `dist/assets/paintings/heron-bank.webp`.

Generation source ID: `01a1634c-8a89-7ae2-9c62-31cea4faa185/exec-7a5973cd-ad7c-460f-b264-574d1fc2b460.png`.

Use case: illustration-story. Create an asset for one cohesive oil-painted landscape in a 3D poetry experience. The reference image supplies BRUSHWORK and PALETTE only. Match its broad, confident, thick impasto strokes, scraped ivory marks, mint and silver-green, deep forest green shadows, occasional vermilion. Avoid tiny photorealistic detail or a polished miniature look. Warm diffuse light comes from upper left. Genuine alpha transparency outside the organic painted silhouette, soft irregular bristle edges, no white or colored backdrop, no frame, text, watermark, fake shadow or floating island.
Asset: a TALL portrait 2:3 vertical riverbank stand, viewed front-on. A single graceful white heron stands near the lower-left of a tall tuft of slender reeds and ivory iris flowers, with long forest-green leaves. The heron is complete, including both feet, on the same low mossy baseline as the plant roots. Leaves rise around and behind the bird to twice its height, airy gaps between reed stems. Broad gestural paint, luminous ivory highlights, dark jade roots, brushwork like the reference. No other animals, people, tree, mountain, horizon, boat, book or water lily. Only a very thin fringe of low moss and pebbles under the feet, NO large ground patch. All edges organically transparent, including air between stems. Designed to stand upright at the edge of a separate horizontal river surface.

### willow-rise

Saved asset: `dist/assets/paintings/willow-rise.webp`.

Generation source ID: `01a1634c-8a89-7ae2-9c62-31cea4faa185/exec-27a5c54f-782b-4364-9e30-3be62e9e1d38.png`.

Use case: illustration-story. Create an asset for one cohesive oil-painted landscape in a 3D poetry experience. The reference image supplies BRUSHWORK and PALETTE only. Match its broad, confident, thick impasto strokes, scraped ivory marks, mint and silver-green, deep forest green shadows, occasional vermilion. Avoid tiny photorealistic detail or a polished miniature look. Warm diffuse light comes from upper left. Genuine alpha transparency outside the organic painted silhouette, soft irregular bristle edges, no white or colored backdrop, no frame, text, watermark, fake shadow or floating island.
Asset: a TALL portrait 2:3 full-height willow tree, viewed front-on. One elegantly arched warm grey trunk grows from exposed roots at the bottom baseline, leaning slightly right. Long slender silver-green willow branches fall in a curtain from the high airy crown, with generous transparent openings between the sweeping boughs. Roots surrounded by a small fringe of dark jade grass and a few pale stones. Whole tree in frame, crown and roots both complete. This is a vertical sculptural landmark in a painted river landscape. NO people, animals, apples, blossoms, boat, house, river, distant background, mountains or large ground patch. The ground will be supplied by another 3D surface. Broad large brush marks with impasto texture, painterly and luminous. Genuine alpha transparency throughout the air around and between the branches.

### valley-horizon

Saved asset: `dist/assets/paintings/valley-horizon.webp`.

Generation source ID: `01a1634c-8a89-7ae2-9c62-31cea4faa185/exec-fbf26d12-7633-482a-97e4-695afa111965.png`.

Use case: illustration-story. Create an asset for one cohesive oil-painted landscape in a 3D poetry experience. The reference image supplies BRUSHWORK and PALETTE only. Match its broad, confident, thick impasto strokes, scraped ivory marks, mint and silver-green, deep forest green shadows, occasional vermilion. Avoid tiny photorealistic detail or a polished miniature look. Warm diffuse light comes from upper left. Genuine alpha transparency outside the organic painted silhouette, soft irregular bristle edges, no white or colored backdrop, no frame, text, watermark, fake shadow or floating island.
Asset: a VERY WIDE 3:1 distant backdrop of a Persian valley, to be positioned vertically far behind the ground plane. A soft low ridge of pale sage and muted blue-green mountains spans the width, highest in the right third. Below it, a narrow distant foothill band and scattered tiny slender cypress trees. Gentle atmospheric perspective, softened large painterly brush marks, ivory glints on ridges. The distant landscape is understated and low-contrast. No large foreground tree, house, people, animals, water lily, book or boat. No sky or clouds: genuine transparency above the irregular mountain skyline. Bottom foothills taper into low meadow-colored bristle strokes with genuine transparent perimeter. Do not include a full foreground floor or rectangular canvas. No duplicated distinctive landmarks; one connected distant valley ridge.

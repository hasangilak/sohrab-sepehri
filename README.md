# Sohrab Sepehri — The Sound of Distance

An immersive bilingual poetry experience inspired by the movement and reading rhythm of https://davidwhyte.com/experience/.

Run `npm run dev` and open http://127.0.0.1:4173. No dependencies or build step are required. Run `npm run export` to make the self-contained `sepehri.html`, with all fonts, artwork, scripts, and the translation embedded for offline use.

To deploy on Vercel, import this repository with the root directory set to `.`. The included `vercel.json` selects the static `dist` directory and runs the JavaScript checks before deployment. No environment variables or backend service are required.

The supplied excerpt from *The Traveler* is translated completely in `dist/poem.js`, with Persian alongside it. Downloadable copies are `dist/translation.txt` and `dist/persian.txt`. This is the full supplied excerpt, not the entire long poem. Section titles are editorial reading labels.

The landscape combines a continuous horizontal painted garden and river that curves continuously into the distant valley, with upright trees, an empty porch, and reeds. Pigment textures blend across the curved far bank with matched color and atmospheric depth, removing the separate foreground edge. There is exactly one human figure in the orchard, and no repeated assets. Roots, steps, the bank, and soft contact shadows share the same world coordinates and depth buffer. Thirteen curved camera landmarks travel sideways and through the scene, looking into tall branches and down toward the water. A damped camera rig eases acceleration and braking; the reading scale stays fixed until one five-percent pullback at the ending. Local water movement, gentle foliage motion, lamp flicker, tea steam and subdued pigment hover remain. In the landscape view, scroll or use +/− to zoom, drag in either direction to explore, and choose Reset view (or press 0) to reset.

The site includes 11 reading passages, an opening and closing scene, English and Persian RTL text on consistent reading edges, a full-text reader, downloadable translation, opt-in synthesized ambience, a motion toggle, reduced-motion support, and keyboard-accessible dialogs. Day and night share one critically damped color transition across paper, gradients, text, and painted lighting (about five seconds to settle). A static painting remains available if WebGL cannot run.

Artwork was generated with the built-in image-generation tool using the user's supplied painting as a style reference; it is not artwork by Sepehri. The final prompt and asset location are recorded in `ARTWORK.md`. Fonts are Cormorant Garamond, Manrope, and locally hosted [Vazir](https://github.com/rastikerdar/vazirmatn/releases/tag/v30.1.0) for Persian; SIL Open Font License notices are included under `dist/assets/licenses/`.

Biography and the 1966 publication date were checked against [Encyclopædia Iranica](https://www.iranicaonline.org/articles/sepehri-sohrab/). The site has no analytics or third-party runtime requests. Sound starts only when enabled by the visitor.

# Art direction and production prompts — City Kit 01

## Shared brief

Use case: illustration-story. Production PNG assets for a 2D side-view city game, RampageRex. Smooth dark charcoal continuous outlines, polished hand-drawn shapes, warm peach terracotta plaster, muted teal metal and doors, mint-green foliage and awning, warm cream trim. Readable medium-low detail, purposeful surface chips, simple stylized shadows. Front orthographic elevation only; no side wall or perspective. Precise straight rectangular outer connection edges for building modules, playful organic interior details. Genuine transparent background and safety margins; all objects intact. No pixel art, voxel, 3D rendering, photographic texture, UI, watermark, lettering, or characters.

The supplied reference informed the lively side-scroller atmosphere, outlined illustration, warm masonry, green accents, and layered city composition. Its pixel grid, fantasy characters, and platform layout were not reproduced. Ground floor established the kit palette; the three decorations use it as an explicit style reference.

Palette brief: charcoal `#34413B`, peach `#DDA077`, terracotta shadow `#C58361`, teal `#477D76`, mint `#A9C987`, cream `#FFF0C8`. These are art-direction targets, not a claim that generated raster colors match every hex exactly.

## Prompt set

### Ground floor

ONE isolated ground-floor component, not a whole building or sprite sheet. Wide rectangular peach-terracotta plaster facade, straight open top edge and parallel vertical sides so upper floors can be stacked. Teal double door, broad dark shop display window with a few simple shelving shapes, mint-and-cream striped awning across window, small coral wall lamp, narrow gray stone plinth. No roof, upper floor, external pavement, lettering, people, or external cast shadow. Surrounding area transparent, facade opaque. Reference energy: lively outlined illustrated side-scroller town, with warm masonry and green accents; no pixel art or 3D.

### Upper floor

ONE repeatable upper-floor facade, wide rectangle approximately 2:1. Uniform peach plaster mass, two identical arched windows with muted teal frames, green shutters, cream lintels, charcoal glass panes, restrained brick repair patches at bottom corners. Slim horizontal cream sill band at bottom. Straight top/bottom, matching facade width. No roof, awning, ground-floor shop, balcony, or plants protruding outside facade. Must stack vertically with itself and connect to the ground floor.

### Roof

ONE flat rooftop parapet cap section for the rectangular peach shop. Wide low proportions about 4:1. Solid peach parapet below, slightly projecting dark teal-green horizontal coping cap above, cream trim. Short terracotta chimney toward left, tiny television aerial toward right. Straight horizontal bottom attachment edge, no building floors or windows beneath. Flat urban roof, not a triangular cottage roof; no angled roof plane.

### Balcony

Ground floor image is a style/palette reference only. Generate ONE separate balcony overlay: wide shallow muted teal wrought-iron railing with simple vertical rails and curved ends, narrow cream stone sill below, one small terracotta planter with mint leaves near left end. See-through gaps between bars genuinely transparent. No wall, window, or building behind it. Front orthographic elevation; generous clear safety margins.

### Shop sign

Ground floor image is a style/palette reference only. Generate ONE separate hanging shop sign. Curved dark metal bracket attaches at left; cream wooden plaque framed in muted teal hangs at right from two rings. Simple terracotta sun emblem at center, absolutely no letters. Bracket and plaque form one connected asset. Plaque face opaque, surrounding area and gaps transparent. No building, wall, ground, or external shadow aura.

### Planter

Ground floor image is a style/palette reference only. Generate ONE separate ground-standing terracotta pot with a compact cluster of broad rounded mint and darker green leaves. Simple readable stems, a few cream highlight shapes, playful silhouette. One pot only, no ground or building or external shadow. Entire base and all leaf tips intact, genuine transparent surrounding area.

## Production notes

- Generated each component independently with the built-in image generation tool, with transparent background enabled.
- Source PNGs copied into this repository without pixel manipulation.
- Actual alpha bounds and facade connection coordinates recorded in `manifest.json`.
- Assembled previews use those coordinates, uniform scaling, and a small outline overlap; they do not bake decorations into the production modules.
- The kit is not a set of editable vector paths. Upper floors are repeatable vertically; the shop textures are not seamless horizontal tiles.

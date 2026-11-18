# Rex: generated animation art

Generated with the built-in imagegen tool on 18 November 2026, using Rex's original `master.png` from commit `5146c71` as the identity reference. The PNG outputs were removed from the working tree after conversion and remain in git history. WebP copies use the repository's existing quality-90 conversion settings.

| File | Poses, reading left to right and top to bottom |
| --- | --- |
| `walk.png` | Eight walking poses, alternating contact, down, passing and up |
| `bite-roar.png` | Four bite poses followed by four roar poses |
| `tail-stomp.png` | Four tail swipe poses followed by four stomp poses |

The updated menu illustration is `../master.png`. `assets/manifest.json` contains the actual source rectangles, ground pivots and scale correction for all 24 poses. The generated sheets have uneven row spacing, so the runtime reads those rectangles instead of assuming an exact grid. Idle uses the neutral tail recovery pose.

## Prompts used

### Walk

Create a production-ready transparent PNG sprite animation atlas for this exact Rex character from the reference image. This is an actual game asset, not a mockup. Use case: stylized-concept. Preserve his exact identity: chunky green dinosaur, dark teal spotted back and outlines, cream segmented belly, golden orange back plates, yellow eye, three red cheek scars, small clawed arms, long tapered tail, warm top rim lighting. Improve edges with clean smooth antialiased hand-drawn linework and consistent rich cel shading; no pixel art. Output one 2048 by 2048 transparent RGBA image arranged in EXACTLY TWO columns and FOUR rows: eight equal 1024 by 512 cells, no gutters, no labels or grid. Each cell contains exactly ONE entire Rex facing RIGHT in a different sequential frame of a smooth eight-frame heavy walking cycle. Read order left to right then top to bottom. Frames: right foot contact, right foot down/recoil, passing with left foot swinging, left foot up, left foot contact, left foot down/recoil, passing with right foot swinging, right foot up. Meaningfully alternate near/far legs and toe placement; subtle head bob and tail follow-through. The first and last frames must loop smoothly. Keep the SAME body scale, head proportions and hip location across every frame; feet ground line at local y=478 in every cell; hip anchor at local x=650. Whole character including long tail and nose stays inside every cell with at least 36px margin. No camera changes, no ground, no shadows outside character, no effects, no text, no checkerboard pattern: genuine alpha transparency. Frame poses must be individually clean with no duplicated limbs or motion blur.

### Bite and roar

Production transparent PNG animation atlas for the exact green Rex dinosaur in reference 1; reference 2 is the already approved walk animation, match its character rendering precisely. Create EIGHT full-body sprite poses in EXACTLY TWO columns and FOUR equal rows on a square transparent canvas, largest available resolution. No borders, no captions, no grid. Each dinosaur faces RIGHT. Identity locked: green spotted skin, cream segmented belly, orange dorsal plates, long tapering tail, yellow eye, red cheek scars, dark teal outlines and rich cartoon cel shading. Clean smooth edges, genuine alpha, no ground shadow. Each cell contains entire dinosaur with 5 percent clear margin, same camera, identical body scale and hip location at 58 percent of cell width; both feet are near the same ground line at 94 percent of cell height. First FOUR cells (top two rows) are a powerful BITE sequence: 1 anticipation head pulled back jaw starting to open, 2 jaws fully open head reaching forward, 3 strong snap closed head reaching forward at contact, 4 recovery head pulling back to neutral. Last FOUR cells (bottom two rows) are a ROAR sequence: 1 chest inhale head lifted slightly and mouth closed, 2 head lifted high with mouth opening, 3 fully open roaring mouth and expanded chest, 4 relaxed recovery mouth nearly closed. These are eight clearly different animation poses, not copies. Entire tails, feet and noses must fit inside their respective cells. No extra arms, no effects, no smoke, no text, no motion blur. Preserve the original character's body proportions and cheerful fierce personality.

### Tail and stomp

Production transparent PNG sprite animation atlas for this exact Rex dinosaur. Match the green chunky Rex's identity and polished cartoon rendering in both references: cream segmented belly, orange dorsal plates, dark teal outlines and spots, yellow eye, red cheek scars, long tapering tail. Output one square transparent RGBA image with EXACTLY TWO equal columns and FOUR equal rows, EIGHT full-body sprites. This is a spritesheet with no grid, text, ground, shadows, effects or checkerboard. Each cell has fixed identical camera and body scale, hips centered at local 58 percent of the cell width and planted foot ground line at 94 percent of the cell height. Character generally faces RIGHT in every frame. Entire character stays within the cell with generous clear margins. Top FOUR cells, read left-to-right: a TAIL SWIPE attack directed to the LEFT behind Rex: (1) windup, upper body bracing and long tail curling upward; (2) forceful leftward tail extension, hips twisting slightly but head still right; (3) follow-through, tail swept low and straight to the far left, both feet braced; (4) recovering tail to its neutral gently curved position. Bottom FOUR cells: STOMP: (1) anticipatory crouch with both feet planted; (2) front/near knee raised high, its foot clearly off the ground while far foot supports body; (3) front/near foot planted hard on baseline with body squashing down in a powerful impact pose; (4) body rising back to neutral both feet planted. Show significant readable pose changes, smooth confident antialiased linework, consistent limbs and proportions, no extra limbs, no motion blur. Genuine transparent background.

Final refinement prompt:

Edit this eight-frame dinosaur animation sheet for game export. Preserve the exact eight poses, character identity, clean cartoon illustration style, TWO-column FOUR-row layout, and genuine alpha transparency. The one correction: none of the sprite silhouettes may touch any outer edge or cell boundary. Uniformly reduce every character by about 12 percent within its own cell, keeping their scale mutually consistent, and give at least 32 pixels of fully transparent margin on all sides within every cell, especially the extended tail in row 2 column 1 and the nose in row 4 column 1. Both planted foot soles should align to a consistent local baseline around 90 percent cell height. Complete any currently clipped tail tip or nose. Clean away isolated colored speckles around the contours, leaving smooth antialiased outlines. No other changes. No text, grid, shadows, checkerboard, background, effects or motion blur. Square PNG at highest available resolution.

### Updated master illustration

Refine the first reference into the updated master PNG illustration of this SAME Rex character for the game's menu and character reference. ONE complete dinosaur, facing right, two feet planted, relaxed fierce expression with closed jaw. Keep the original silhouette, proportions, green skin and teal spots, cream belly, orange back plates, yellow eye and three red cheek scars. Match the polished rendering and clean smooth contours of the walk sheet in reference 2. Improve clean antialiased outlines, remove stray red/colored edge speckles, maintain sharp intentional detail and consistent cel shading with warm top rim lighting. Wide horizontal composition roughly 1.9:1 aspect ratio, full long tail left and whole head right, comfortable transparent margins on all four sides. Genuine transparent RGBA background; no scenery, no floor, no ground shadow, no text, no checkerboard, no watermark. High resolution production game illustration.

## Amukan Rex ultimate

Generated with the built-in imagegen tool on 18 November 2026, using the current master and walk atlas as identity references. WebP copies use quality 90 and method 6; the PNG outputs were removed from the working tree afterwards and remain in git history.

- `ulti.png`: eight poses, from crouch through rearing, drop, impact (index 5), rebound and recovery.
- `../../../fx/ulti-cutin.png`: transparent close-up for the left banner.

The atlas uses measured source rectangles rather than equal row boundaries; the second row starts higher on the right. Ground pivots align planted feet, and scale 1.18 matches the existing walking sprites. No gameplay timing or cooldown changes are needed.

### Ultimate atlas prompt

Production transparent PNG sprite animation atlas for this exact Rex dinosaur. Match the green chunky Rex's identity and polished cartoon rendering in both references precisely: cream segmented belly, orange dorsal plates, dark teal outlines and spots, yellow eye, three red cheek scars, small clawed arms, long tapering tail, warm top rim lighting. Output one square transparent RGBA image, largest available resolution, with EXACTLY TWO equal columns and FOUR equal rows: EIGHT full-body sprites, read left to right then top to bottom. No grid, borders, text, ground, shadows or checkerboard. Every cell has the same fixed camera and the same body scale, hips at 58 percent of the cell width, planted feet on a ground line at 90 percent of the cell height, and at least 32 pixels of fully transparent margin on all sides. Rex faces RIGHT in every frame.

This is his ULTIMATE attack, a furious rearing ground slam:
(1) deep anticipatory crouch, body low and coiled, head tucked down, tail curled, eyes narrowed;
(2) starting to rear up, chest swelling, head pulling back, small arms flexing, dorsal plates beginning to glow hot orange;
(3) reared up tall on straightened legs, chest fully inflated, head thrown back with jaws wide open roaring at the sky, dorsal plates glowing bright orange-yellow, tail whipping upward;
(4) peak of the rear: both small arms spread wide, jaws at their widest, whole body stretched to its tallest, plates at their brightest glow;
(5) the drop: body plunging forward and down, head driving toward the ground, both feet about to hit, tail high behind him;
(6) IMPACT: both feet and the underside of the tail slammed flat on the ground line, body squashed low and wide, head lunged forward with jaws open in a roar, plates still glowing;
(7) rebound: body springing back up to mid height, mouth closing, plate glow fading to a dull ember;
(8) settling into his neutral standing pose, jaw closed, plates back to their normal orange.

Eight clearly different, individually clean poses with big readable silhouette changes. The glow belongs to the dorsal plates themselves: no aura, no flames, no smoke, no shockwave, no dust, no speed lines, no motion blur. No extra limbs. Smooth confident antialiased linework, consistent proportions, genuine alpha transparency. The whole character, including the raised head in frames 3 and 4 and the full tail, stays inside its own cell.

### Ultimate cut-in prompt

Dramatic close-up key art of this exact Rex dinosaur for a fighting-game style super move cut-in banner. Same character identity and polished cartoon cel shading as the references: green skin with dark teal spots and outlines, cream segmented belly and jaw, orange dorsal plates, yellow eye, three red cheek scars. Wide horizontal composition, 16:9, high resolution, genuine transparent RGBA background.

Framing: head, neck and upper chest only, seen in a dynamic three-quarter view facing RIGHT and slightly toward the viewer, shot from a low angle so he looms. Jaws thrown wide open in a furious roar, teeth and pink tongue clearly visible, brow furrowed, the yellow eye blazing with a small bright highlight, saliva strands kept minimal. The dorsal plates along the back of the neck glow hot orange-yellow as if lit from within, casting a warm rim light across the top of the head and snout; deep teal shadows under the jaw and on the neck for strong contrast.

Place the head in the upper-right two thirds of the frame. The lower-left third shows only the darker neck and chest, calm and low in detail, because a title will be overlaid there. The neck and back run off the left and bottom edges of the canvas; the snout and upper jaw keep a small transparent margin from the right and top edges.

Thick confident antialiased outlines, clean silhouette, rich saturated colour. No background, no scenery, no speed lines, no energy aura, no flames, no smoke, no text, no letters, no logo, no frame, no border, no watermark, no checkerboard.

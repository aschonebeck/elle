# Elle Azghari — spiral portfolio (editable source)

Open `index.html` in a browser. No build tools or libraries required.

## Files
- `index.html`: semantic page, filter controls, project view
- `styles.css`: all typography, layout, dotted spiral, responsive gallery
- `script.js`: PROJECTS data, spiral math, endless scroll, filtering and project navigation
- `assets/`: 20 original uploaded WebP images

## Editing content
At the top of `script.js`, `PROJECTS` lists fictional project titles and images.
Immediately below the DOM selectors, demo `category`, `slug` and `gallery` values are assigned.
**These category classifications and multi-image galleries are placeholders**, not real project metadata. Replace them with actual project-specific galleries and `art`/`commission` categories. The gallery currently reuses other supplied images for demonstration only.

## Behavior
- ALL / ART / COMMISSION filters change the projects inside the same endless spiral.
- Click a piece to open a scrollable project view with title and gallery over the paused spiral.
- Close returns to the same spiral position.
- Project URLs use `#project/project-slug`, so direct links work without a server router.
- The dotted line remains visible. The brand changes on hover.

The About and Contact links still use placeholder email addresses. Replace before launch.

Mobile: 6 visible images, same mathematical coordinates for path and image centers, visible project titles. Desktop unchanged.

Mobile width update: horizontal radius 41vw (was 31vw), eased radial spacing 0.82; dotted path and artwork share identical coordinates.

Mobile: spiral shifted 3.5vw left and 4vh upward; widened to 44.5vw radius and slightly taller. Both dotted path and image coordinates use the same function.

Removed numeric counter. Added a faded dotted spiral continuation beyond the last artwork, gentle scroll inertia, and a mobile-only disappearing scroll hint.

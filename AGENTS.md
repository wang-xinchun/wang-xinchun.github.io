# Hidden Signals - Agent Guide

> A static personal research website for Xinchun Wang, a second-year Computer Science undergraduate at Shandong Normal University.

## Project Overview

This is a **single-page static portfolio website** for an undergraduate computer vision researcher. It presents academic identity, research thesis, representative first-author work, personal achievements, ongoing work, timeline, and contact information.

The site is built entirely with **vanilla HTML, CSS, and JavaScript**. There are no build tools, no frameworks, and no external runtime dependencies. Everything runs directly in the browser.

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single-page markup (~579 lines). Defines hero, quick contact links, global page rail, research thesis, representative work, achievements, experiments, timeline, and contact sections. |
| `styles.css` | All styles (~2733 lines). Design tokens, layouts, cards, canvas atmosphere, responsive rules, and visual components. |
| `script.js` | Browser interactivity (~422 lines). Canvas background, global page rail state, stage labels, custom cursor, reveal observer, and card hover tilt. |
| `assets/emblem-sdnu.png` | Transparent Shandong Normal University emblem used in the hero academic snapshot card. |
| `assets/logo-huawei.png` | Huawei logo used in the Huawei Spark Award / 3D SBS card. |
| `assets/avatar-xinchun.png` | Personal illustrated avatar revealed from the tilted hero hover card. |
| `assets/paper-preview-kbs.png` | First-page preview image for the KBS SCI Q1 manuscript under review. |
| `assets/paper-preview-neurocomputing.png` | First-page preview image for the Neurocomputing SCI Q2 manuscript under review. |

### Content Sections

1. **Hero** - Name, university, tilted avatar reveal card, academic snapshot, three publication status cards, and Huawei Spark Award / 3D SBS challenge card.
2. **Research Thesis** - Explains the core research question: how vision systems stay reliable when the visual signal is weak.
3. **Representative First-Author Work** - CTTA paper deep dive with Problem / Method / Evidence logic, a performance evidence panel, and a method guardrail panel.
4. **Personal Achievements** - CTTA KBS SCI Q1 first-author submission, DABit-Mamba Neurocomputing SCI Q2 first-author submission, and IEEE TGRS SCI Q1 third-author publication.
5. **Experiments** - Ongoing AAAI-oriented work-in-progress description and lab terminal visual.
6. **Timeline** - Research milestones from CV entry to submissions and published TGRS work.
7. **Contact** - Placeholder contact information and profile links.

## Technology Stack

- **HTML5** semantic markup
- **CSS3** with custom properties, grid layouts, glass panels, responsive breakpoints, `backdrop-filter`, masks, and animations
- **Vanilla ES6+ JavaScript**
- **Canvas 2D API** for the full-screen procedural background
- **IntersectionObserver API** for scroll-triggered reveal animations

## Build and Run

There is **no build step**. To view the site locally:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use any static file server
python -m http.server 8000
npx serve .
```

Then navigate to `http://localhost:8000`.

On a server, the site can be served from the project directory on port `6006`:

```bash
cd wang-xinchun.github.io
python -m http.server 6006 --bind 0.0.0.0
```

## Runtime Architecture

### Canvas Background (`perceptionCanvas`)

A full-screen fixed `<canvas>` renders a procedural visual field that reacts to pointer position and scroll progress:

- **Grid nodes** - A field of points that distort based on pointer proximity and scroll stage.
- **Stage-driven visuals** - As the user scrolls, the canvas transitions through four visual modes:
  - Pixel
  - Pattern
  - Token
  - Semantic
- **Pointer halo** - A radial glow follows the pointer with eased interpolation.

### Natural Page Scroll

The previous page-flip / section-rotation effect has been removed. Sections now use normal document flow and natural vertical scrolling.

The scroll position is still used only to:

- Update the `stageLabel` text in the hero academic snapshot.
- Drive the canvas background stage progression.
- Highlight the active story card in the Research Thesis section.

No section-level `rotateX`, `rotateY`, `translate3d`, blur, scale, or page-flip transforms are applied during scroll.

### Custom Cursor

On fine-pointer devices (`hover: hover and pointer: fine`), the native cursor is hidden and replaced by a custom DOM cursor:

- Central dot
- Conic-gradient orbit ring
- Axis crosshairs
- Contextual label populated from `data-cursor` attributes

The cursor scales and changes color when hovering interactive targets.

### Interactive Cards

Elements with `.interactive-card` respond to mouse position with local 3D tilt and a dynamic glow gradient. This is a hover-only card effect, not a page-flip effect. It is disabled on touch/mobile-style pointer environments by the fine-pointer media query.

### Global Page Rail

The fixed `.site-page-rail` lives outside `<main>` and marks the full website sequence:

- `01` Home
- `02` Thesis
- `03` Paper
- `04` Achieve
- `05` 3D
- `06` Time
- `07` Contact

`script.js` updates `.rail-node.is-active` and `#pageRailNumber` as the user scrolls. The rail is hidden on small screens to avoid crowding mobile layouts.

### Representative Work Evidence And Method Panels

The third section uses a right-side `.paper-right-stack` instead of the old black-blue decorative illustration. It combines a `.paper-evidence-panel` and a `.paper-method-panel` so the right side has performance evidence and method guardrails. The evidence panel presents real CTTA metrics from the manuscript:

- `mean_ds Fwβ = 0.8994`
- `mean_ds MAE = 0.0153`
- low-difficulty regression `28.8% -> 13.3%`
- CHAMELEON, CAMO, COD10K, and NC4K baseline-vs-CTTA table
- matched-compute / matched-adjustment note

The method panel summarizes ARC, HBR, and DMEP as the guardrail chain behind output-only CTTA.

## Code Organization

- **HTML** - Semantic sections with inline content and local asset links.
- **CSS** -
  - `:root` design tokens
  - Base styles and utilities
  - Global site page rail
  - Hero personal avatar reveal card
  - Hero academic snapshot cards
  - Research thesis cards
  - Paper evidence panel
  - Paper method guardrail panel
  - Achievement cards
  - Experiment, timeline, and contact layouts
  - Responsive breakpoints at `1100px` and `760px`
  - Reduced-motion overrides
- **JavaScript** -
  - DOM element caching and state initialization
  - Canvas: `resizeCanvas`, `buildGrid`, `drawBackground`, `drawGrid`, `drawSemanticContours`
  - Stage labels: `getStageFromScroll`, `updateActiveStoryCard`
  - Cursor and interactive-card hover motion
  - Reveal observer
  - Animation loop: `animate()` using `requestAnimationFrame`

## Development Conventions

- **No external dependencies** - Do not add npm packages or CDN links unless absolutely necessary.
- **Local assets** - Keep important visual assets in `assets/` so the site does not depend on external image hosts.
- **Natural scroll** - Do not reintroduce section-level page-flip, scroll-rotation, blur, or depth transforms unless explicitly requested.
- **CSS custom properties** - Dynamic hover values such as cursor position, card rotation, glow position, and scan shift are written to CSS variables.
- **Reduced motion** - CSS disables animations/transitions for `prefers-reduced-motion: reduce`. Canvas still renders, but section flipping no longer exists.
- **Responsive breakpoints** -
  - `1100px`: multi-column layouts reduce to 2 columns where needed.
  - `760px`: layouts collapse to a single column, custom cursor and top nav are hidden.

## Testing

There is **no automated test suite**. Manual testing checklist:

1. Open `index.html` or the static server URL in Chrome, Firefox, Safari, and Edge.
2. Verify the page scrolls naturally without page-flip, section tilt, section blur, or section zoom.
3. Verify canvas background renders and responds to mouse movement.
4. Scroll through all sections and confirm reveal animations run smoothly.
5. Hover interactive cards on desktop and confirm local tilt/glow works without moving whole sections.
6. Verify the CTTA evidence panel table is readable on desktop and horizontally scrollable on mobile.
7. Resize the browser and confirm grids collapse cleanly.
8. Test mobile or emulator view; confirm single-column layout and hidden custom cursor/nav.
9. Enable OS-level "Reduce motion" and confirm CSS animations/transitions are suppressed.

## Deployment

Deploy as a static site. Any host serving static files works:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront

Ensure these assets are included in the deployment bundle:

- `assets/emblem-sdnu.png`
- `assets/logo-huawei.png`
- `assets/avatar-xinchun.png`
- `assets/paper-preview-kbs.png`
- `assets/paper-preview-neurocomputing.png`

## Security Considerations

- There is no backend, no authentication, and no user data collection.
- Email and GitHub are real links (`1198383781w@gmail.com`, `https://github.com/wang-xinchun`). Google Scholar is still a placeholder (`/`) until the real profile URL is available.
- Do not publish manuscript PDF originals while submissions are still under review. Only first-page preview images are linked publicly.

## Customization Notes for Agents

- **Profile content** - Hero identity currently uses Xinchun Wang / Wang Xinchun, Shandong Normal University, second-year CS undergraduate.
- **Contact placeholders** - Search for `Google Scholar` to replace the remaining placeholder profile link.
- **Stage names** - The four research stages are defined in `script.js` (`stageNames`) and affect canvas/stage label behavior only.
- **Color palette** - Defined in `:root` in `styles.css`. Key colors: `--bg`, `--ink`, `--deep`, `--accent`, `--acid`, `--signal`.
- **Adding a new section** - Add the HTML inside `<main>` and write its CSS. No JavaScript section registration is required for scroll motion.

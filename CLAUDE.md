# CLAUDE.md — AUI Design System Instructions

Please read and strictly follow [`AGENTS.md`](./AGENTS.md) and [`DESIGN_SPEC.md`](./DESIGN_SPEC.md) in this repository.

## Core Design Mandate
- **Aesthetic**: Apple HIG Frosted Glass (`backdrop-filter: blur(28px) saturate(190%)`) + Pure OLED Dark Mode (`#000000` background, `#1c1c1e` card) / iOS Grouped Light Mode (`#f2f2f7` background, `#ffffff` card).
- **Golden Rule**: *"Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining."*
- **Navigation**: Bottom Floating Glass Dock (`.dock` + `.dock-btn`) for primary views; `.capsule-switcher` or `.sticky-toolbar` + `.segmented-control` for sub-views.
- **Starter Assets**:
  - Modular CSS & JS: `src/css/aui.css` (or individual files in `src/css/`) + `src/js/aui-core.js`
  - Bundled Single-File Assets: `dist/aui.bundle.css` + `dist/aui.bundle.js`
  - HTML Starters: `templates/single-file-starter.html` (Single-File pattern) and `templates/modular-starter.html` (Modular pattern)
  - Live Reference Showcase: `index.html`

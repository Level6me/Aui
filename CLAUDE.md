# CLAUDE.md — AUI 2.0 Design System Instructions

Please read and strictly follow [`AGENTS.md`](./AGENTS.md) and [`DESIGN_SPEC.md`](./DESIGN_SPEC.md) in this repository.

## Core Design Mandate
- **Aesthetic**: Apple HIG Frosted Glass (`--glass-regular` + `--glass-rim` specular highlight) + Pure OLED Dark Mode (`#000000` background, `#1c1c1e` card, HIG-brightened `#0a84ff` / `#30d158` / `#ff9f0a` / `#ff453a` / `#bf5af2`) / iOS Grouped Light Mode (`#f2f2f7` background, `#ffffff` card).
- **Golden Rule**: *"Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining."*
- **Navigation & Overlays**:
  - Bottom concentric Floating Glass Dock (`.dock` + `.dock-btn` + SF Symbols-style `.aui-icon` SVGs) for primary views;
  - `.sticky-toolbar` / `.sticky-toolbar.bare` + spring-sliding `.segmented-control` or `.capsule-switcher` for sub-views;
  - Spotlight Command Palette (`⌘K` / `AUI.registerCommands`), Frosted Popover (`.popover-menu`), Inset Grouped List (`.list-group`), Adaptive Bottom Sheet (`.modal-sheet` + `.sheet-grabber`), and Apple Alert Confirm (`await auiConfirm(...)`).
- **Accessibility**: Preserve pinch-zoom, `:focus-visible`, modal focus trap, `44×44px` coarse-pointer targets, `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast`.
- **Starter Assets**:
  - Modular CSS & JS: `src/css/aui.css` + `src/js/aui-core.js`
  - Bundled Assets: `dist/aui.bundle.css` + `dist/aui.bundle.js` (`npm run build` / `npm run build:min` / `npm run check`)
  - HTML Starters: `templates/single-file-starter.html` (Single-File) and `templates/modular-starter.html` (Modular)
  - Live Showcase: `index.html`

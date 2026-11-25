# AI Agent Web UI Development Rules (AUI 2.0 Design System)

> **Target AI Agents**: Antigravity, Claude Code, Cursor, Windsurf, Codex, Copilot.
> **Design Philosophy**: Apple HIG Frosted-Glass Aesthetic + High-Density Self-Explanatory Layout.

When the user asks you to build, redesign, or scaffold a Web UI / Dashboard / Console / Web App using this repository (`Aui`), you **MUST** strictly follow every rule in this file and in [`DESIGN_SPEC.md`](./DESIGN_SPEC.md).

---

## 1. Non-Negotiable Core Principle

> **“Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.”**
> （严禁添加多余的次级标签、冗长的解释性副标题或说明段落，让空间布局、字重对比与色彩语义自己解释界面。）

- **NO** introductory welcome banners or explanatory paragraphs above dashboards or tables.
- **NO** verbose helper descriptions under every card title or form input when the label + placeholder or visual layout already makes the purpose obvious.
- **NO** third-party UI frameworks (Bootstrap, Material UI, Ant Design, Chakra) that override the Apple HIG frosted-glass aesthetic.
- **ALWAYS** use the exact CSS variables, class names, concentric border radii, frosted-glass blur tiers (`--glass-regular` + `--glass-rim`), and spring transitions (`cubic-bezier(0.1, 0.8, 0.25, 1)`) provided in `src/css/`.

---

## 2. Choose the Right Architecture Pattern for the New Project

Depending on the backend/deployment requirements of the new project, select one of the two canonical AUI architectures:

### Pattern A: Single-File Zero-Dependency Console
- **When to use**: Python (Flask/FastAPI/http.server), Go, Rust, or C++ lightweight daemon web consoles where a single HTML template (`templates/index.html`) is preferred.
- **Starter Template**: Copy [`templates/single-file-starter.html`](./templates/single-file-starter.html) or inline [`dist/aui.bundle.css`](./dist/aui.bundle.css) + [`dist/aui.bundle.js`](./dist/aui.bundle.js) directly into your HTML file.

### Pattern B: Modular Source + Zero-Dep Bundler + PWA
- **When to use**: Standalone WebUIs, PWAs, or complex multi-module frontend applications.
- **Starter Structure**:
  - Copy `src/css/*.css` (`variables.css`, `base.css`, `layout.css`, `components.css`, `data-display.css`, `dock.css`, `modal.css`) and `src/js/aui-core.js`.
  - Use [`templates/modular-starter.html`](./templates/modular-starter.html) as the entry HTML and [`scripts/build.js`](./scripts/build.js) (`npm run build` / `npm run check`) to bundle into `dist/`.

---

## 3. Mandatory Visual & Structural Checklist

1. **Theme Engine (`auto` / `light` / `dark`) + Dark Mode Luminance Calibration**:
   - Root element: `<html lang="zh-CN" data-theme="auto">`; include the 1-line `<head>` theme init snippet to prevent FOUC.
   - Light mode background MUST be `#f2f2f7` with `#ffffff` cards; Dark mode background MUST be pure OLED black `#000000` with `#1c1c1e` primary cards, `#2c2c2e` secondary blocks, and HIG-brightened semantic colors (`#0a84ff`, `#30d158`, `#ff9f0a`, `#ff453a`, `#bf5af2`).
   - Include the theme toggle pill button in `.header-actions` calling `cycleTheme()`.
2. **Adaptive Header (`.header`)**:
   - Left (`.header-left`): `.date-badge` (with pulsing `.status-dot` + uppercase system status) stacked above `.title` (`28px–32px`, `font-weight: 800`, `letter-spacing: -0.03em`).
   - Right (`.header-actions`): Compact `.pill-btn` actions (including optional `⌘K` Command Palette trigger via `data-aui-cmd`). Wrap button text in `<span class="pill-text">...</span>` so mobile screens (`≤ 640px`) automatically collapse buttons into clean icon pills.
3. **KPI Stat Cards (`.grid-4` / `.grid-6` + `.card`)**:
   - Always use `minmax(0, 1fr)` grids (`.grid-4` collapses to `2x2` on mobile, never `1x4`).
   - Big numbers (`.val-big`) MUST use `font-variant-numeric: tabular-nums` and semantic colors (`var(--accent)`, `var(--success)`, `var(--warning)`, `var(--danger)`, `var(--purple)`, `var(--indigo)`, `var(--teal)`).
   - Make KPI cards clickable (`.card.interactive` or `.stat-interactive`) to jump directly to filtered views whenever applicable.
4. **Navigation — Floating Glass Dock (`.dock`) & Spotlight (`⌘K`)**:
   - Primary top-level navigation (3 to 6 pages) MUST live in the bottom centered Floating Glass Dock (`<nav class="dock">`) with concentric `.dock-btn` (`border-radius: 24px`) and SF Symbols-style linear `.aui-icon` SVGs.
   - Always place `<div class="bottom-spacer"></div>` at the bottom of each `.page` so the floating dock never obscures content.
   - Secondary switching uses `.sticky-toolbar` + `.segmented-control` (auto-enhanced with spring sliding `.segment-indicator`) / `.tab-bar`, or `.sticky-toolbar.bare` + `.sticky-toolbar-row` + `.capsule-switcher`.
   - Use `AUI.registerCommands([...])` to expose quick actions via `⌘K` / `Ctrl+K`.
5. **Tables, Card Grids, Grouped Lists & Adaptive Overlays**:
   - Wrap tables in `.table-wrap` for horizontal touch scrolling. Combine primary identifier (`.ip-text` in monospace) and secondary metadata (`.geo-subline`) into a single stacked cell. Use `.popover-menu` (`togglePopover`) instead of crowding rows with many buttons.
   - Use `.list-group-header` + `.list-group` + `.list-row` for Apple Inset Grouped Settings lists, and `.skeleton` / `.empty-state` for loading & empty states.
   - Use `.modal-overlay` + `.modal-sheet` (auto-adapts into a mobile Bottom Sheet with `.sheet-grabber` below `640px`), `await auiConfirm('...', { title, danger })` for destructive confirmations (never `window.confirm`), and `showToast('...', { type })` for non-blocking top pill notifications (never `window.alert`).
   - Respect Apple HIG accessibility: keep pinch-zoom enabled (never `user-scalable=no`), preserve `:focus-visible`, `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast`.

---

## 4. Quick Reference: Core CSS Classes & Runtime APIs

| Category | Classes / APIs |
| :--- | :--- |
| **Layout & Grids** | `.container` (`.wide`, `.compact`), `.header`, `.header-left`, `.date-badge`, `.title`, `.header-actions`, `.btn-text-mobile`, `.btn-text-full`, `.sticky-toolbar` (`.bare`, `.sticky-toolbar-row`), `.controls-bar`, `.filter-row`, `.grid-2`, `.grid-3`, `.grid-4`, `.grid-6`, `.card` (`.interactive`, `.card-flush`), `.card-header` (`.header-action-wrap`), `.card-title`, `.inset-panel`, `.inset-subpanel`, `.inset-panel-header`, `.inset-panel-footer`, `.chart-box`, `.chart-mini`, `.bottom-spacer` |
| **KPI & Icons** | `.val-big`, `.val-sub`, `.stat-interactive`, `.mono`, `.tabular`, `.aui-icon` (`.sm`, `.lg`), `.kbd` |
| **Buttons** | `.btn` (`.secondary`, `.danger`, `.success`, `.w-full`), `.pill-btn` (`.accent`/`.primary`, `.danger`, `.success`, `.warning`, `.active`), `.icon-btn` (`.accent`, `.danger`), `.action-btn`, `.copy-chip` (`.copied`) |
| **Switchers & Tabs** | `.segmented-control` + `.segment-btn` (+ auto `.segment-indicator`), `.capsule-switcher` + `.pill-btn`, `.tab-bar` + `.tab-item`, `.sort-pill`, `.batch-bar` |
| **Inputs & Lists** | `.input-box` / `.form-control` / `.input-field`, `.input-group`, `.search-box`, `.select-custom`, `.switch` (`.accent`) + `.slider`, `.form-group`, `.form-grid` (`.auto-fit`), `.form-label`, `.form-label-row` + `.form-label-action`, `.form-hint`, `.form-error` (`.active`), `.checkbox-group`, `.checkbox-item`, `.checkbox-card`, `.radio-group`, `.radio-item`, `.setting-row`, `.list-group-header`, `.list-group`, `.list-row` (`.interactive`, `.list-row-icon`, `.list-row-value`, `.list-chevron`) |
| **Status & Badges** | `.status-dot` (`.warning`, `.danger`), `.badge` / `.tag` (`.accent`, `.success`, `.warning`, `.danger`, `.purple`, `.indigo`, `.teal`, `.pink`, `.yellow`, `.neutral`), `.live-pill` (`.accent`, `.success`, `.warning`), `.callout` (`.accent`, `.success`, `.warning`, `.danger`, `.callout-title`, `.callout-body`), `.progress-track` + `.progress-fill` |
| **Data Display** | `.table-toolbar` + `.table-toolbar-summary`, `.table-wrap`, `.subtable-box` (`.subtable-header`, `.subtable-scroll`), `.ip-text`, `.geo-subline`, `.cell-time-stack` (`.time-date`, `.time-clock`), `.cell-truncate`, `.cell-actions`, `.col-right`, `.table-empty`, `.item-grid-container`, `.item-card`, `.rank-item`, `.rank-num` (`.top1`, `.top2`, `.top3`, `.normal`), `.rank-bar-bg`, `.rank-bar-fill`, `.diag-row-item` (`.diag-row-left`, `.diag-rank-badge`, `.diag-text-title`, `.diag-count-text`), `.kv-panel` (`.kv-panel-head`, `.kv-grid`, `.kv-label`, `.kv-value`), `.timeline` (`.timeline-item`, `.timeline-axis`, `.timeline-dot`, `.timeline-line`, `.timeline-card`), `.pagination-wrapper` (`.pagination-info`, `.pagination-controls`, `.page-pill`), `.skeleton` (`.skeleton-line`), `.empty-state` |
| **Navigation & Overlays** | `.dock`, `.dock-btn`, `.page`, `.modal-overlay` (`.layer-sub`, `.layer-confirm`, `.forced-login`, `.alert-overlay`), `.modal-sheet` (`.wide`, `.flex-sheet`, `.modal-header`, `.modal-title`, `.modal-close`, `.modal-body`, `.modal-footer`, `.alert-sheet`, `.sheet-grabber`), `.popover-menu` (`.popover-header`, `.popover-item`, `.popover-divider`), `.cmd-overlay` / `.cmd-sheet`, `.toast-container`, `.toast-pill` (`.success`, `.warning`, `.danger`), `.mini-floating-hud` |
| **Runtime (`window.AUI`)** | `setTheme`, `cycleTheme`, `getThemeMode`, `isDarkEffective`, `onThemeChange`, `switchPage`, `switchSubView`, `refreshSegmentedControls`, `openModal`, `closeModal`, `confirm` (`auiConfirm`), `registerCommands`, `openCommandPalette`, `togglePopover`, `closePopovers`, `copyText`, `showToast`, `renderPagination`, `formatTimeStack`, `escapeHtml`, `getChartThemeTokens` |
| **Declarative Triggers** | `data-aui-hash` (on `<html>`), `data-aui-modal="id"`, `data-aui-close-modal="id"`, `data-aui-popover="id"`, `data-aui-copy="text"`, `data-aui-cmd` |

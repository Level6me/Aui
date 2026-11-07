# AI Agent Web UI Development Rules (AUI Design System)

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
- **ALWAYS** use the exact CSS variables, class names, border radii, frosted-glass blur (`backdrop-filter: blur(28px) saturate(190%)`), and spring transitions (`cubic-bezier(0.1, 0.8, 0.25, 1)`) provided in `src/css/`.

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
  - Use [`templates/modular-starter.html`](./templates/modular-starter.html) as the entry HTML and [`scripts/build.js`](./scripts/build.js) to bundle into `dist/`.

---

## 3. Mandatory Visual & Structural Checklist

1. **Theme Engine (`auto` / `light` / `dark`)**:
   - Root element: `<html lang="zh-CN" data-theme="auto">`.
   - Light mode background MUST be `#f2f2f7` with `#ffffff` cards; Dark mode background MUST be pure OLED black `#000000` with `#1c1c1e` primary cards and `#2c2c2e` secondary blocks.
   - Include the theme toggle pill button in `.header-actions` calling `cycleTheme()`.
2. **Adaptive Header (`.header`)**:
   - Left (`.header-left`): `.date-badge` (with pulsing `.status-dot` + uppercase system status) stacked above `.title` (`28px–32px`, `font-weight: 800`, `letter-spacing: -0.03em`).
   - Right (`.header-actions`): Compact `.pill-btn` actions. Wrap button text in `<span class="pill-text">...</span>` so mobile screens (`≤ 640px`) automatically collapse buttons into clean icon pills.
3. **KPI Stat Cards (`.grid-4` / `.grid-6` + `.card`)**:
   - Always use `minmax(0, 1fr)` grids (`.grid-4` collapses to `2x2` on mobile, never `1x4`).
   - Big numbers (`.val-big`) MUST use `font-variant-numeric: tabular-nums` and semantic colors (`var(--accent)`, `var(--success)`, `var(--warning)`, `var(--danger)`, `var(--purple)`).
   - Make KPI cards clickable (`.card.interactive` or `.stat-interactive`) to jump directly to filtered views whenever applicable.
4. **Navigation — Floating Glass Dock (`.dock`)**:
   - Primary top-level navigation (3 to 6 pages) MUST live in the bottom centered Floating Glass Dock (`<nav class="dock">`), NOT in a traditional left sidebar or top navbar.
   - Always place `<div class="bottom-spacer"></div>` at the bottom of each `.page` so the floating dock never obscures content.
   - Secondary switching within a page uses either `.sticky-toolbar` + `.tab-bar` / `.segmented-control` or `.capsule-switcher`.
5. **Tables, Card Grids & Modals**:
   - Wrap tables in `.table-wrap` for horizontal touch scrolling. Combine primary identifier (`.ip-text` in monospace) and secondary metadata (`.geo-subline`) into a single stacked cell to keep tables compact.
   - Use `.modal-overlay` + `.modal-sheet` for dialogs, and `showToast('...')` for non-blocking top pill notifications (never use `window.alert`).

---

## 4. Quick Reference: Core CSS Classes

| Category | Classes |
| :--- | :--- |
| **Layout & Grids** | `.container`, `.header`, `.header-left`, `.date-badge`, `.title`, `.header-actions`, `.sticky-toolbar`, `.grid-2`, `.grid-3`, `.grid-4`, `.grid-6`, `.card`, `.card.interactive`, `.card-header`, `.card-title`, `.bottom-spacer` |
| **KPI & Typography** | `.val-big`, `.val-sub`, `.stat-interactive`, `.mono`, `.tabular` |
| **Buttons** | `.btn` (`.secondary`, `.danger`, `.success`, `.w-full`), `.pill-btn` (`.accent`, `.danger`, `.success`, `.warning`, `.active`), `.icon-btn`, `.action-btn` |
| **Switchers & Tabs** | `.segmented-control` + `.segment-btn`, `.capsule-switcher` + `.pill-btn`, `.tab-bar` + `.tab-item`, `.sort-pill` |
| **Inputs & Forms** | `.input-box` / `.form-control`, `.search-box`, `.select-custom`, `.switch` + `.slider`, `.form-group`, `.form-label`, `.setting-row`, `.setting-label`, `.setting-desc` |
| **Status & Badges** | `.status-dot` (`.warning`, `.danger`), `.badge` / `.tag` (`.accent`, `.success`, `.warning`, `.danger`, `.purple`, `.neutral`), `.progress-track` + `.progress-fill` |
| **Data Display** | `.table-wrap`, `.ip-text`, `.geo-subline`, `.item-grid-container`, `.item-card`, `.rank-item`, `.rank-num` (`.top1`, `.top2`, `.top3`, `.normal`), `.rank-bar-bg`, `.rank-bar-fill`, `.pagination-wrapper`, `.page-pill` |
| **Navigation & Overlays** | `.dock`, `.dock-btn`, `.page`, `.modal-overlay`, `.modal-sheet`, `.toast-container`, `.toast-pill`, `.mini-floating-hud` |

/**
 * AUI Design System — Zero-Dependency Core Runtime (aui-core.js v2.0)
 * Provides:
 * 1. Adaptive 3-Mode Theme Engine (auto / light / dark) + OS change listener
 * 2. Floating Glass Dock Page Router + Hash Sync + Keyboard Shortcuts (1-9, Esc, ⌘K)
 * 3. Spring Sliding Segmented Control & Capsule Switcher Helper
 * 4. Accessible Frosted Modal & Adaptive Bottom Sheet Controller (Focus Trap + Restore)
 * 5. Apple Alert Async Confirmation Dialog (auiConfirm)
 * 6. Spotlight Command Palette (⌘K / Ctrl+K)
 * 7. Frosted Popover / Context Menu Engine
 * 8. Top Frosted Toast Pill Notification Engine (Semantic Types + Hover Pause + ARIA)
 * 9. Inline Copy Helper & Declarative data-aui-* Delegation
 * 10. Chart.js Theme Color Helper
 */

(function (window) {
    'use strict';

    const THEME_STORAGE_KEY = 'aui_theme_mode';
    const THEME_MODES = ['auto', 'light', 'dark'];
    const THEME_ICONS = { auto: '🌓', light: '☀️', dark: '🌙' };
    const THEME_LABELS = { auto: '自动', light: '浅色', dark: '深色' };
    const MAX_TOASTS = 3;
    const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function safeGetStorage(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (_) {
            return null;
        }
    }

    function safeSetStorage(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (_) {
            // Ignore storage errors in restricted/private environments
        }
    }

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    // --- 1. Adaptive Theme Engine ---
    let currentThemeMode = safeGetStorage(THEME_STORAGE_KEY) || 'auto';
    if (!THEME_MODES.includes(currentThemeMode)) currentThemeMode = 'auto';
    const themeListeners = [];

    function isDarkEffective(mode) {
        const m = mode || currentThemeMode;
        if (m === 'dark') return true;
        if (m === 'light') return false;
        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function syncThemeColorMeta(dark, mode) {
        const existing = document.getElementById('aui-dynamic-theme-color');
        if (mode === 'auto') {
            if (existing) existing.remove();
            return;
        }
        const color = dark ? '#000000' : '#f2f2f7';
        if (existing) {
            existing.setAttribute('content', color);
        } else if (document.head) {
            const meta = document.createElement('meta');
            meta.id = 'aui-dynamic-theme-color';
            meta.name = 'theme-color';
            meta.content = color;
            document.head.appendChild(meta);
        }
    }

    function setTheme(mode) {
        if (!THEME_MODES.includes(mode)) mode = 'auto';
        currentThemeMode = mode;
        safeSetStorage(THEME_STORAGE_KEY, mode);
        document.documentElement.setAttribute('data-theme', mode);

        const iconEl = document.getElementById('theme-icon');
        const labelEl = document.getElementById('theme-label');
        if (iconEl) iconEl.textContent = THEME_ICONS[mode];
        if (labelEl) labelEl.textContent = THEME_LABELS[mode];

        const dark = isDarkEffective(mode);
        syncThemeColorMeta(dark, mode);

        themeListeners.forEach(fn => {
            try { fn(dark, mode); } catch (e) { console.error(e); }
        });
    }

    function cycleTheme() {
        const nextIdx = (THEME_MODES.indexOf(currentThemeMode) + 1) % THEME_MODES.length;
        setTheme(THEME_MODES[nextIdx]);
    }

    function getThemeMode() {
        return currentThemeMode;
    }

    function onThemeChange(callback) {
        if (typeof callback === 'function') themeListeners.push(callback);
    }

    // Apply persisted theme attribute immediately to minimize FOUC
    document.documentElement.setAttribute('data-theme', currentThemeMode);
    syncThemeColorMeta(isDarkEffective(currentThemeMode), currentThemeMode);

    if (window.matchMedia) {
        const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleOsChange = () => {
            if (currentThemeMode === 'auto') setTheme('auto');
        };
        if (typeof darkMedia.addEventListener === 'function') {
            darkMedia.addEventListener('change', handleOsChange);
        } else if (typeof darkMedia.addListener === 'function') {
            darkMedia.addListener(handleOsChange);
        }
    }

    // --- 2. Floating Glass Dock Page Router ---
    function findDockButtonForPage(pageId) {
        const dockBtns = document.querySelectorAll('.dock .dock-btn');
        for (const btn of dockBtns) {
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (btn.dataset.page === pageId || onclickAttr.includes(`'${pageId}'`) || onclickAttr.includes(`"${pageId}"`)) {
                return btn;
            }
        }
        return null;
    }

    function switchPage(pageId, title, btnEl, options = {}) {
        const target = document.getElementById(pageId);
        if (!target) return;

        document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
        target.classList.add('active');

        const activeBtn = btnEl || findDockButtonForPage(pageId);
        if (activeBtn) {
            document.querySelectorAll('.dock-btn').forEach(b => {
                b.classList.remove('active');
                b.removeAttribute('aria-current');
            });
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-current', 'page');
        }

        const resolvedTitle = title || (activeBtn && (activeBtn.dataset.title || activeBtn.textContent.trim())) || '';
        const titleEl = document.getElementById('page-title');
        if (titleEl && resolvedTitle) titleEl.textContent = resolvedTitle;

        if (options.syncHash !== false && document.documentElement.hasAttribute('data-aui-hash')) {
            try {
                if (window.location.hash !== '#' + pageId) {
                    window.history.replaceState(null, '', '#' + pageId);
                }
            } catch (_) {}
        }

        if (options.scroll !== false) {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }

        requestAnimationFrame(refreshAllSegmentedControls);

        window.dispatchEvent(new CustomEvent('aui:pagechange', {
            detail: { pageId, title: resolvedTitle }
        }));
    }

    // --- 3. Spring Sliding Segmented Control & Sub-View Helper ---
    function updateSegmentedControl(ctrl) {
        if (!ctrl) return;
        const activeBtn = ctrl.querySelector('.segment-btn.active');
        let indicator = ctrl.querySelector(':scope > .segment-indicator');

        if (!activeBtn || activeBtn.offsetWidth === 0) {
            if (indicator) indicator.style.opacity = '0';
            return;
        }
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'segment-indicator';
            indicator.setAttribute('aria-hidden', 'true');
            ctrl.insertBefore(indicator, ctrl.firstChild);
            ctrl.classList.add('has-indicator');
        }
        indicator.style.opacity = '1';
        indicator.style.width = activeBtn.offsetWidth + 'px';
        indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }

    function refreshAllSegmentedControls() {
        document.querySelectorAll('.segmented-control').forEach(updateSegmentedControl);
    }

    function switchSubView(groupSelector, targetId, btnEl, activeClass = 'active') {
        if (groupSelector && groupSelector !== '.noop') {
            document.querySelectorAll(groupSelector).forEach(el => {
                el.style.display = 'none';
            });
        }
        if (targetId && targetId !== 'none') {
            const target = document.getElementById(targetId);
            if (target) {
                target.style.display = '';
                if (window.getComputedStyle(target).display === 'none') {
                    target.style.display = 'block';
                }
            }
        }

        if (btnEl && btnEl.parentElement) {
            Array.from(btnEl.parentElement.children).forEach(sibling => {
                if (sibling.classList.contains('segment-indicator')) return;
                sibling.classList.remove(activeClass, 'active', 'accent');
                if (sibling.tagName === 'BUTTON') sibling.setAttribute('aria-selected', 'false');
            });
            btnEl.classList.add(activeClass);
            if (btnEl.tagName === 'BUTTON') btnEl.setAttribute('aria-selected', 'true');

            if (btnEl.parentElement.classList.contains('segmented-control')) {
                updateSegmentedControl(btnEl.parentElement);
            }
        }

        window.dispatchEvent(new CustomEvent('aui:subviewchange', {
            detail: { groupSelector, targetId }
        }));
    }

    // --- 4. Accessible Modal & Adaptive Bottom Sheet Controller ---
    let pendingConfirmResolve = null;
    const modalFocusStack = [];

    function settleConfirm(result) {
        if (typeof pendingConfirmResolve === 'function') {
            const resolve = pendingConfirmResolve;
            pendingConfirmResolve = null;
            resolve(!!result);
        }
    }

    function syncModalScrollLock() {
        const hasOverlay = document.querySelectorAll('.modal-overlay.active, .cmd-overlay.active').length > 0;
        document.documentElement.classList.toggle('modal-open', hasOverlay);
        document.body.classList.toggle('modal-open', hasOverlay);
    }

    function getFocusableElements(container) {
        return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
            el => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
        );
    }

    function openModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        closePopovers();

        const sheet = el.querySelector('.modal-sheet, .modal-card');
        if (sheet) {
            if (!sheet.hasAttribute('role')) sheet.setAttribute('role', 'dialog');
            sheet.setAttribute('aria-modal', 'true');
            if (!sheet.classList.contains('alert-sheet') && !sheet.querySelector('.sheet-grabber')) {
                const grabber = document.createElement('div');
                grabber.className = 'sheet-grabber';
                grabber.setAttribute('aria-hidden', 'true');
                sheet.insertBefore(grabber, sheet.firstChild);
            }
        }

        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modalFocusStack.push({ id, opener });

        el.classList.add('active');
        syncModalScrollLock();

        if (sheet) {
            setTimeout(() => {
                const focusables = getFocusableElements(sheet);
                const first = focusables.find(n => n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') || focusables[0];
                if (first) {
                    try { first.focus(); } catch (_) {}
                }
            }, 30);
        }
    }

    function restoreFocusForModal(closedId) {
        for (let i = modalFocusStack.length - 1; i >= 0; i--) {
            if (modalFocusStack[i].id === closedId) {
                const { opener } = modalFocusStack.splice(i, 1)[0];
                if (opener && opener.isConnected) {
                    try { opener.focus(); } catch (_) {}
                }
                break;
            }
        }
    }

    function closeModal(id) {
        let closedId = null;
        if (id) {
            const el = document.getElementById(id);
            if (el && el.classList.contains('active')) {
                el.classList.remove('active');
                closedId = el.id;
                if (el.id === 'aui-confirm-modal') settleConfirm(false);
            }
        } else {
            const activeOverlays = Array.from(document.querySelectorAll('.modal-overlay.active'));
            for (let i = activeOverlays.length - 1; i >= 0; i--) {
                if (!activeOverlays[i].classList.contains('forced-login')) {
                    activeOverlays[i].classList.remove('active');
                    closedId = activeOverlays[i].id;
                    if (activeOverlays[i].id === 'aui-confirm-modal') settleConfirm(false);
                    break;
                }
            }
        }
        syncModalScrollLock();
        if (closedId) restoreFocusForModal(closedId);
    }

    function handleModalFocusTrap(e) {
        if (e.key !== 'Tab') return;
        const activeOverlays = Array.from(document.querySelectorAll('.modal-overlay.active'));
        if (activeOverlays.length === 0) return;
        const topOverlay = activeOverlays[activeOverlays.length - 1];
        const sheet = topOverlay.querySelector('.modal-sheet, .modal-card') || topOverlay;
        const focusables = getFocusableElements(sheet);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    // --- 5. Apple Alert Async Confirmation Dialog ---
    function ensureConfirmModal() {
        let overlay = document.getElementById('aui-confirm-modal');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'aui-confirm-modal';
        overlay.className = 'modal-overlay alert-overlay';
        overlay.style.zIndex = '2400';

        const sheet = document.createElement('div');
        sheet.className = 'modal-sheet alert-sheet';
        sheet.setAttribute('role', 'alertdialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-labelledby', 'aui-confirm-title');
        sheet.setAttribute('aria-describedby', 'aui-confirm-message');

        const titleEl = document.createElement('div');
        titleEl.id = 'aui-confirm-title';
        titleEl.className = 'alert-title';

        const msgEl = document.createElement('div');
        msgEl.id = 'aui-confirm-message';
        msgEl.className = 'alert-message';

        const actions = document.createElement('div');
        actions.className = 'alert-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'aui-confirm-cancel';
        cancelBtn.className = 'pill-btn';
        cancelBtn.addEventListener('click', () => {
            closeModal('aui-confirm-modal');
            settleConfirm(false);
        });

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.id = 'aui-confirm-ok';
        okBtn.className = 'pill-btn accent';
        okBtn.addEventListener('click', () => {
            const resolve = pendingConfirmResolve;
            pendingConfirmResolve = null;
            closeModal('aui-confirm-modal');
            if (typeof resolve === 'function') resolve(true);
        });

        actions.appendChild(cancelBtn);
        actions.appendChild(okBtn);
        sheet.appendChild(titleEl);
        sheet.appendChild(msgEl);
        sheet.appendChild(actions);
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);
        return overlay;
    }

    function auiConfirm(message, options = {}) {
        settleConfirm(false);
        ensureConfirmModal();
        const titleEl = document.getElementById('aui-confirm-title');
        const msgEl = document.getElementById('aui-confirm-message');
        const cancelBtn = document.getElementById('aui-confirm-cancel');
        const okBtn = document.getElementById('aui-confirm-ok');

        const title = options.title || '操作确认';
        const confirmText = options.confirmText || '确认';
        const cancelText = options.cancelText || '取消';
        const isDanger = !!options.danger;

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = String(message ?? '');
        if (cancelBtn) cancelBtn.textContent = cancelText;
        if (okBtn) {
            okBtn.textContent = confirmText;
            okBtn.className = isDanger ? 'pill-btn danger' : 'pill-btn accent';
        }

        openModal('aui-confirm-modal');
        setTimeout(() => {
            const focusTarget = isDanger ? cancelBtn : okBtn;
            if (focusTarget) {
                try { focusTarget.focus(); } catch (_) {}
            }
        }, 35);

        return new Promise(resolve => {
            pendingConfirmResolve = resolve;
        });
    }

    // --- 6. Spotlight Command Palette (⌘K / Ctrl+K) ---
    let customCommands = [];
    let cmdFiltered = [];
    let cmdSelectedIdx = 0;
    let cmdOpener = null;

    function registerCommands(items) {
        if (Array.isArray(items)) {
            customCommands = items.slice();
        }
    }

    function collectCommands() {
        const list = [];
        document.querySelectorAll('.dock .dock-btn').forEach((btn, idx) => {
            const label = btn.textContent.trim();
            if (!label) return;
            list.push({
                id: 'dock-' + idx,
                group: '导航',
                title: label,
                subtitle: '切换视图',
                shortcut: String(idx + 1),
                action: () => btn.click()
            });
        });
        list.push({
            id: 'theme-cycle',
            group: '外观',
            title: '切换深浅色主题',
            subtitle: `当前：${THEME_LABELS[currentThemeMode]}`,
            shortcut: 'Theme',
            action: () => cycleTheme()
        });
        customCommands.forEach((cmd, i) => {
            if (cmd && cmd.title && typeof cmd.action === 'function') {
                list.push({
                    id: cmd.id || 'custom-' + i,
                    group: cmd.group || '快捷操作',
                    title: cmd.title,
                    subtitle: cmd.subtitle || '',
                    shortcut: cmd.shortcut || '',
                    action: cmd.action
                });
            }
        });
        return list;
    }

    function ensureCommandPalette() {
        let overlay = document.getElementById('aui-cmd-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'aui-cmd-overlay';
        overlay.className = 'cmd-overlay';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeCommandPalette();
        });

        const sheet = document.createElement('div');
        sheet.className = 'cmd-sheet';
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-label', '快捷命令面板');

        const inputWrap = document.createElement('div');
        inputWrap.className = 'cmd-input-wrap';

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('class', 'aui-icon');
        icon.style.color = 'var(--text-sec)';
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '11');
        circle.setAttribute('cy', '11');
        circle.setAttribute('r', '7');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '16.65');
        line.setAttribute('y1', '16.65');
        line.setAttribute('x2', '21');
        line.setAttribute('y2', '21');
        icon.appendChild(circle);
        icon.appendChild(line);

        const input = document.createElement('input');
        input.id = 'aui-cmd-input';
        input.type = 'text';
        input.placeholder = '输入命令或页面名称...';
        input.autocomplete = 'off';
        input.addEventListener('input', () => renderCommandItems(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (cmdFiltered.length > 0) {
                    cmdSelectedIdx = (cmdSelectedIdx + 1) % cmdFiltered.length;
                    highlightCommandItem();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cmdFiltered.length > 0) {
                    cmdSelectedIdx = (cmdSelectedIdx - 1 + cmdFiltered.length) % cmdFiltered.length;
                    highlightCommandItem();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const chosen = cmdFiltered[cmdSelectedIdx];
                if (chosen) {
                    closeCommandPalette();
                    chosen.action();
                }
            }
        });

        const escBadge = document.createElement('span');
        escBadge.className = 'kbd';
        escBadge.textContent = 'ESC';

        inputWrap.appendChild(icon);
        inputWrap.appendChild(input);
        inputWrap.appendChild(escBadge);

        const list = document.createElement('div');
        list.id = 'aui-cmd-list';
        list.className = 'cmd-list';

        const footer = document.createElement('div');
        footer.className = 'cmd-footer';
        const hintLeft = document.createElement('span');
        hintLeft.textContent = '↑↓ 选择 · ↵ 执行';
        const hintRight = document.createElement('span');
        hintRight.className = 'mono';
        hintRight.textContent = '⌘K / Ctrl+K';
        footer.appendChild(hintLeft);
        footer.appendChild(hintRight);

        sheet.appendChild(inputWrap);
        sheet.appendChild(list);
        sheet.appendChild(footer);
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);
        return overlay;
    }

    function highlightCommandItem() {
        const list = document.getElementById('aui-cmd-list');
        if (!list) return;
        const buttons = list.querySelectorAll('.cmd-item');
        buttons.forEach((btn, idx) => {
            const active = idx === cmdSelectedIdx;
            btn.classList.toggle('selected', active);
            if (active) btn.scrollIntoView({ block: 'nearest' });
        });
    }

    function renderCommandItems(query) {
        const list = document.getElementById('aui-cmd-list');
        if (!list) return;
        const q = String(query || '').trim().toLowerCase();
        const all = collectCommands();
        cmdFiltered = all.filter(item => {
            if (!q) return true;
            return (
                item.title.toLowerCase().includes(q) ||
                (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
                (item.group && item.group.toLowerCase().includes(q))
            );
        });
        cmdSelectedIdx = 0;
        list.textContent = '';

        if (cmdFiltered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'cmd-empty';
            empty.textContent = '无匹配命令';
            list.appendChild(empty);
            return;
        }

        let lastGroup = '';
        cmdFiltered.forEach((item, idx) => {
            if (item.group && item.group !== lastGroup) {
                lastGroup = item.group;
                const grp = document.createElement('div');
                grp.className = 'cmd-group-label';
                grp.textContent = item.group;
                list.appendChild(grp);
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cmd-item' + (idx === 0 ? ' selected' : '');

            const left = document.createElement('div');
            const title = document.createElement('div');
            title.textContent = item.title;
            left.appendChild(title);
            if (item.subtitle) {
                const sub = document.createElement('div');
                sub.className = 'cmd-item-sub';
                sub.textContent = item.subtitle;
                left.appendChild(sub);
            }
            btn.appendChild(left);

            if (item.shortcut) {
                const kbd = document.createElement('span');
                kbd.className = 'kbd';
                kbd.textContent = item.shortcut;
                btn.appendChild(kbd);
            }
            btn.addEventListener('mouseenter', () => {
                cmdSelectedIdx = idx;
                highlightCommandItem();
            });
            btn.addEventListener('click', () => {
                closeCommandPalette();
                item.action();
            });
            list.appendChild(btn);
        });
    }

    function openCommandPalette() {
        closePopovers();
        const overlay = ensureCommandPalette();
        cmdOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        overlay.classList.add('active');
        syncModalScrollLock();
        const input = document.getElementById('aui-cmd-input');
        if (input) {
            input.value = '';
            renderCommandItems('');
            setTimeout(() => {
                try { input.focus(); } catch (_) {}
            }, 20);
        }
    }

    function closeCommandPalette() {
        const overlay = document.getElementById('aui-cmd-overlay');
        if (!overlay || !overlay.classList.contains('active')) return;
        overlay.classList.remove('active');
        syncModalScrollLock();
        if (cmdOpener && cmdOpener.isConnected) {
            try { cmdOpener.focus(); } catch (_) {}
        }
        cmdOpener = null;
    }

    // --- 7. Frosted Popover / Context Menu ---
    let activePopoverId = null;

    function closePopovers() {
        document.querySelectorAll('.popover-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
        activePopoverId = null;
    }

    function togglePopover(triggerEl, menuId) {
        const menu = document.getElementById(menuId);
        if (!menu || !triggerEl) return;

        const isSameOpen = activePopoverId === menuId && menu.classList.contains('active');
        closePopovers();
        if (isSameOpen) return;

        menu.classList.add('active');
        activePopoverId = menuId;

        const rect = triggerEl.getBoundingClientRect();
        const menuW = menu.offsetWidth || 200;
        const menuH = menu.offsetHeight || 160;
        const margin = 10;

        let left = rect.right - menuW;
        if (left < margin) left = Math.max(margin, rect.left);
        if (left + menuW > window.innerWidth - margin) {
            left = Math.max(margin, window.innerWidth - menuW - margin);
        }

        let top = rect.bottom + 6;
        if (top + menuH > window.innerHeight - margin && rect.top - menuH - 6 > margin) {
            top = rect.top - menuH - 6;
            menu.style.transformOrigin = 'bottom right';
        } else {
            menu.style.transformOrigin = 'top right';
        }

        menu.style.left = Math.round(left) + 'px';
        menu.style.top = Math.round(top) + 'px';
    }

    // --- 8. Top Frosted Toast Pill Notification Engine ---
    function showToast(message, optionsOrDuration = 2600) {
        let duration = 2600;
        let type = '';
        if (typeof optionsOrDuration === 'number') {
            duration = optionsOrDuration;
        } else if (optionsOrDuration && typeof optionsOrDuration === 'object') {
            if (typeof optionsOrDuration.duration === 'number') duration = optionsOrDuration.duration;
            if (typeof optionsOrDuration.type === 'string') type = optionsOrDuration.type;
        }

        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');

        while (container.children.length >= MAX_TOASTS) {
            container.removeChild(container.firstElementChild);
        }

        const pill = document.createElement('div');
        pill.className = 'toast-pill' + (type ? ' ' + type : '');
        if (type) {
            const dot = document.createElement('span');
            dot.className = 'toast-dot';
            pill.appendChild(dot);
        }
        const textNode = document.createElement('span');
        textNode.textContent = String(message ?? '');
        pill.appendChild(textNode);
        container.appendChild(pill);

        let timer = null;
        const dismiss = () => {
            if (!pill.isConnected) return;
            pill.style.opacity = '0';
            pill.style.transform = 'translateY(-10px) scale(0.95)';
            pill.style.transition = 'all 0.2s ease';
            setTimeout(() => pill.remove(), 220);
        };
        const startTimer = () => {
            timer = setTimeout(dismiss, duration);
        };
        pill.addEventListener('mouseenter', () => { if (timer) clearTimeout(timer); });
        pill.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    // --- 9. Inline Copy Helper ---
    function copyText(text, triggerOrMessage) {
        const value = String(text ?? '');
        const isEl = triggerOrMessage instanceof HTMLElement;
        const successMsg = typeof triggerOrMessage === 'string' ? triggerOrMessage : `已复制 ${value}`;

        const onDone = (ok) => {
            if (!ok) {
                showToast('当前环境不支持自动复制，请手动选择文本', { type: 'warning' });
                return;
            }
            if (isEl) {
                triggerOrMessage.classList.add('copied');
                setTimeout(() => triggerOrMessage.classList.remove('copied'), 1200);
            }
            showToast(successMsg, { type: 'success' });
        };

        const fallbackCopy = () => {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
            ta.remove();
            onDone(ok);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value).then(() => onDone(true)).catch(fallbackCopy);
        } else {
            fallbackCopy();
        }
    }

    // --- 10. Chart.js Palette Helper ---
    function readCssVar(name, fallback) {
        const val = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return val || fallback;
    }

    function getChartThemeTokens() {
        const dark = isDarkEffective();
        return {
            isDark: dark,
            gridColor: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(120, 120, 128, 0.10)',
            tickColor: readCssVar('--text-sec', dark ? '#98989d' : '#8e8e93'),
            accent: readCssVar('--accent', dark ? '#0a84ff' : '#007aff'),
            accentFill: dark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.08)',
            success: readCssVar('--success', dark ? '#30d158' : '#34c759'),
            successFill: dark ? 'rgba(48, 209, 88, 0.18)' : 'rgba(52, 199, 89, 0.08)',
            danger: readCssVar('--danger', dark ? '#ff453a' : '#ff3b30'),
            dangerFill: dark ? 'rgba(255, 69, 58, 0.18)' : 'rgba(255, 59, 48, 0.08)',
            warning: readCssVar('--warning', dark ? '#ff9f0a' : '#ff9500'),
            purple: readCssVar('--purple', dark ? '#bf5af2' : '#af52de'),
            indigo: readCssVar('--indigo', dark ? '#5e5ce6' : '#5856d6'),
            teal: readCssVar('--teal', dark ? '#40c8e0' : '#30b0c7'),
            pink: readCssVar('--pink', dark ? '#ff375f' : '#ff2d55'),
            yellow: readCssVar('--yellow', dark ? '#ffd60a' : '#ffcc00')
        };
    }

    // --- Global Listeners, Declarative Delegation & Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
        setTheme(currentThemeMode);

        // Initialize aria-current on default active dock button
        const initActiveDock = document.querySelector('.dock .dock-btn.active');
        if (initActiveDock) initActiveDock.setAttribute('aria-current', 'page');

        // Hash deep-link support
        const hashId = window.location.hash ? window.location.hash.slice(1) : '';
        if (hashId) {
            const hashPage = document.getElementById(hashId);
            if (hashPage && hashPage.classList.contains('page')) {
                switchPage(hashId, null, null, { scroll: false, syncHash: false });
            }
        }

        // Initialize sliding segmented controls
        requestAnimationFrame(refreshAllSegmentedControls);
        window.addEventListener('resize', () => requestAnimationFrame(refreshAllSegmentedControls));

        // Delegated click handlers (Backdrop, Popovers & CSP-friendly data-aui-* attributes)
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Modal backdrop click
            if (
                target &&
                target.classList &&
                target.classList.contains('modal-overlay') &&
                target.classList.contains('active') &&
                !target.classList.contains('forced-login')
            ) {
                closeModal(target.id);
                return;
            }

            // Declarative triggers
            const trigger = target && target.closest ? target.closest('[data-aui-modal], [data-aui-close-modal], [data-aui-popover], [data-aui-copy], [data-aui-cmd]') : null;
            if (trigger) {
                if (trigger.hasAttribute('data-aui-modal')) {
                    openModal(trigger.getAttribute('data-aui-modal'));
                    return;
                }
                if (trigger.hasAttribute('data-aui-close-modal')) {
                    closeModal(trigger.getAttribute('data-aui-close-modal') || undefined);
                    return;
                }
                if (trigger.hasAttribute('data-aui-popover')) {
                    e.stopPropagation();
                    togglePopover(trigger, trigger.getAttribute('data-aui-popover'));
                    return;
                }
                if (trigger.hasAttribute('data-aui-copy')) {
                    copyText(trigger.getAttribute('data-aui-copy'), trigger);
                    return;
                }
                if (trigger.hasAttribute('data-aui-cmd')) {
                    openCommandPalette();
                    return;
                }
            }

            // Close popover when clicking outside or on a popover action item
            if (activePopoverId) {
                const insideMenu = target && target.closest && target.closest('.popover-menu');
                if (!insideMenu || (target.closest && target.closest('.popover-item'))) {
                    closePopovers();
                }
            }
        });

        window.addEventListener('resize', closePopovers);

        // Global keyboard shortcuts: ⌘K / Ctrl+K, Esc, Focus Trap, 1-9 Dock tabs
        document.addEventListener('keydown', (e) => {
            if (e.isComposing) return;

            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const cmdOverlay = document.getElementById('aui-cmd-overlay');
                if (cmdOverlay && cmdOverlay.classList.contains('active')) {
                    closeCommandPalette();
                } else {
                    openCommandPalette();
                }
                return;
            }

            if (e.key === 'Escape') {
                const cmdOverlay = document.getElementById('aui-cmd-overlay');
                if (cmdOverlay && cmdOverlay.classList.contains('active')) {
                    closeCommandPalette();
                    return;
                }
                if (activePopoverId) {
                    closePopovers();
                    return;
                }
                closeModal();
                return;
            }

            handleModalFocusTrap(e);

            const target = e.target;
            const tag = (target && target.tagName) ? target.tagName.toLowerCase() : '';
            if (
                tag === 'input' ||
                tag === 'textarea' ||
                tag === 'select' ||
                (target && target.isContentEditable) ||
                e.metaKey ||
                e.ctrlKey ||
                e.altKey ||
                e.shiftKey ||
                document.querySelector('.modal-overlay.active, .cmd-overlay.active')
            ) {
                return;
            }
            const num = parseInt(e.key, 10);
            if (num >= 1 && num <= 9) {
                const dockBtns = document.querySelectorAll('.dock .dock-btn');
                if (dockBtns[num - 1]) {
                    dockBtns[num - 1].click();
                }
            }
        });
    });

    // --- 9.5 HTML Escaping, Two-Line Time Stack & Universal Pagination Renderer ---
    function escapeHtml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function formatTimeStack(timeStr) {
        const s = timeStr == null ? '' : String(timeStr).trim();
        if (!s || s === '--' || s === '-') {
            return '<span class="val-sub">--</span>';
        }
        const parts = s.split(/\s+/);
        if (parts.length >= 2) {
            return `<div class="cell-time-stack"><span class="time-date">${escapeHtml(parts[0])}</span><span class="time-clock">${escapeHtml(parts.slice(1).join(' '))}</span></div>`;
        }
        return `<span class="tabular" style="font-size: 12px;">${escapeHtml(parts[0])}</span>`;
    }

    function renderPagination(containerOrId, options = {}) {
        const container = typeof containerOrId === 'string'
            ? document.getElementById(containerOrId)
            : containerOrId;
        if (!container) return;

        const pageSize = Math.max(1, Number(options.pageSize) || 50);
        const totalItems = Math.max(0, Number(options.totalItems) || 0);
        const totalPages = Math.max(1, Number(options.totalPages) || Math.ceil(totalItems / pageSize) || 1);
        const currentPage = Math.min(totalPages, Math.max(1, Number(options.currentPage) || 1));
        const unitLabel = options.unitLabel || '条记录';
        const onPageChange = typeof options.onPageChange === 'function' ? options.onPageChange : () => {};

        container.classList.add('pagination-wrapper');
        container.textContent = '';

        const info = document.createElement('div');
        info.className = 'pagination-info';
        info.innerHTML = `共 <b>${totalItems}</b> ${escapeHtml(unitLabel)} · 每页 ${pageSize} 条 · 当前第 <b class="page-current">${currentPage} / ${totalPages}</b> 页`;

        const controls = document.createElement('div');
        controls.className = 'pagination-controls';

        const makeBtn = (label, page, { active = false, disabled = false, ariaLabel = '' } = {}) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'page-pill' + (active ? ' active' : '');
            btn.textContent = label;
            btn.disabled = disabled;
            if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
            if (!disabled && !active) {
                btn.addEventListener('click', () => onPageChange(page));
            }
            return btn;
        };

        controls.appendChild(makeBtn('‹', currentPage - 1, { disabled: currentPage <= 1, ariaLabel: '上一页' }));

        const pages = [];
        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                pages.push(p);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        pages.forEach(p => {
            if (p === '...') {
                const span = document.createElement('span');
                span.className = 'val-sub';
                span.style.padding = '0 4px';
                span.textContent = '…';
                controls.appendChild(span);
            } else {
                controls.appendChild(makeBtn(String(p), p, { active: p === currentPage }));
            }
        });

        controls.appendChild(makeBtn('›', currentPage + 1, { disabled: currentPage >= totalPages, ariaLabel: '下一页' }));

        container.appendChild(info);
        container.appendChild(controls);
    }

    // Expose global AUI API & shorthand functions
    window.AUI = {
        setTheme,
        cycleTheme,
        getThemeMode,
        isDarkEffective,
        onThemeChange,
        switchPage,
        switchSubView,
        refreshSegmentedControls: refreshAllSegmentedControls,
        openModal,
        closeModal,
        confirm: auiConfirm,
        registerCommands,
        openCommandPalette,
        closeCommandPalette,
        togglePopover,
        closePopovers,
        copyText,
        showToast,
        renderPagination,
        formatTimeStack,
        escapeHtml,
        getChartThemeTokens
    };

    window.cycleTheme = cycleTheme;
    window.switchPage = switchPage;
    window.switchSubView = switchSubView;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.auiConfirm = auiConfirm;
    window.openCommandPalette = openCommandPalette;
    window.togglePopover = togglePopover;
    window.closePopovers = closePopovers;
    window.copyText = copyText;
    window.showToast = showToast;
    window.renderPagination = renderPagination;
    window.formatTimeStack = formatTimeStack;
    window.escapeHtml = escapeHtml;

})(window);

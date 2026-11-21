/**
 * AUI Design System — Zero-Dependency Core Runtime (aui-core.js)
 * Provides:
 * 1. Adaptive 3-Mode Theme Engine (auto / light / dark) + OS change listener
 * 2. Floating Glass Dock Page Router + Keyboard Shortcuts (1-9, Esc)
 * 3. Segmented Control & Capsule Switcher Helper
 * 4. Frosted Modal Sheet Controller (with forced-login guard & delegation)
 * 5. Top Frosted Toast Pill Notification Engine
 * 6. Chart.js Theme Color Helper
 */

(function (window) {
    'use strict';

    const THEME_STORAGE_KEY = 'aui_theme_mode';
    const THEME_MODES = ['auto', 'light', 'dark'];
    const THEME_ICONS = { auto: '🌓', light: '☀️', dark: '🌙' };
    const THEME_LABELS = { auto: '自动', light: '浅色', dark: '深色' };
    const MAX_TOASTS = 3;

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
        const color = dark ? '#1c1c1e' : '#007aff';
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

    // Listen to OS dark mode changes when in 'auto' mode
    if (window.matchMedia) {
        const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
        const handleOsChange = () => {
            if (currentThemeMode === 'auto') {
                setTheme('auto');
            }
        };
        if (typeof darkMedia.addEventListener === 'function') {
            darkMedia.addEventListener('change', handleOsChange);
        } else if (typeof darkMedia.addListener === 'function') {
            darkMedia.addListener(handleOsChange);
        }
    }

    // --- Dock Page Navigation ---
    function switchPage(pageId, title, btnEl) {
        document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');

        if (!btnEl) {
            const dockBtns = document.querySelectorAll('.dock .dock-btn');
            for (const btn of dockBtns) {
                const onclickAttr = btn.getAttribute('onclick') || '';
                if (btn.dataset.page === pageId || onclickAttr.includes(`'${pageId}'`) || onclickAttr.includes(`"${pageId}"`)) {
                    btnEl = btn;
                    break;
                }
            }
        }

        if (btnEl) {
            document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
            btnEl.classList.add('active');
        }

        const titleEl = document.getElementById('page-title');
        if (titleEl && title) titleEl.textContent = title;

        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

        window.dispatchEvent(new CustomEvent('aui:pagechange', {
            detail: { pageId, title }
        }));
    }

    // --- Sub-Tab & Segmented Control Helper ---
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
                sibling.classList.remove(activeClass, 'active', 'accent');
            });
            btnEl.classList.add(activeClass);
        }

        window.dispatchEvent(new CustomEvent('aui:subviewchange', {
            detail: { groupSelector, targetId }
        }));
    }

    // --- Modal Controller & Frosted Confirm Dialog ---
    let pendingConfirmResolve = null;

    function settleConfirm(result) {
        if (typeof pendingConfirmResolve === 'function') {
            const resolve = pendingConfirmResolve;
            pendingConfirmResolve = null;
            resolve(!!result);
        }
    }

    function syncModalScrollLock() {
        const hasActiveModal = document.querySelectorAll('.modal-overlay.active').length > 0;
        document.documentElement.classList.toggle('modal-open', hasActiveModal);
        document.body.classList.toggle('modal-open', hasActiveModal);
    }

    function openModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('active');
        syncModalScrollLock();
    }

    function closeModal(id) {
        if (id) {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('active');
                if (el.id === 'aui-confirm-modal') settleConfirm(false);
            }
        } else {
            const activeOverlays = Array.from(document.querySelectorAll('.modal-overlay.active'));
            for (let i = activeOverlays.length - 1; i >= 0; i--) {
                if (!activeOverlays[i].classList.contains('forced-login')) {
                    activeOverlays[i].classList.remove('active');
                    if (activeOverlays[i].id === 'aui-confirm-modal') settleConfirm(false);
                    break;
                }
            }
        }
        syncModalScrollLock();
    }

    function ensureConfirmModal() {
        let overlay = document.getElementById('aui-confirm-modal');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'aui-confirm-modal';
        overlay.className = 'modal-overlay';
        overlay.style.zIndex = '2400';

        const sheet = document.createElement('div');
        sheet.className = 'modal-sheet';
        sheet.style.maxWidth = '390px';
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-labelledby', 'aui-confirm-title');

        const titleEl = document.createElement('div');
        titleEl.id = 'aui-confirm-title';
        titleEl.className = 'card-title';
        titleEl.style.marginBottom = '10px';

        const msgEl = document.createElement('div');
        msgEl.id = 'aui-confirm-message';
        msgEl.style.fontSize = '13px';
        msgEl.style.lineHeight = '1.55';
        msgEl.style.color = 'var(--text-sec)';
        msgEl.style.marginBottom = '18px';
        msgEl.style.whiteSpace = 'pre-wrap';

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '8px';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'aui-confirm-cancel';
        cancelBtn.className = 'pill-btn';
        cancelBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            syncModalScrollLock();
            settleConfirm(false);
        });

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.id = 'aui-confirm-ok';
        okBtn.className = 'pill-btn accent';
        okBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            syncModalScrollLock();
            settleConfirm(true);
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
        const overlay = ensureConfirmModal();
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
        if (okBtn) {
            setTimeout(() => {
                try { okBtn.focus(); } catch (_) {}
            }, 20);
        }

        return new Promise(resolve => {
            pendingConfirmResolve = resolve;
        });
    }

    // --- Toast Notification Engine ---
    function showToast(message, duration = 2600) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        while (container.children.length >= MAX_TOASTS) {
            container.removeChild(container.firstElementChild);
        }

        const pill = document.createElement('div');
        pill.className = 'toast-pill';
        pill.textContent = String(message ?? '');
        container.appendChild(pill);

        setTimeout(() => {
            if (!pill.isConnected) return;
            pill.style.opacity = '0';
            pill.style.transform = 'translateY(-10px) scale(0.95)';
            pill.style.transition = 'all 0.2s ease';
            setTimeout(() => pill.remove(), 220);
        }, duration);
    }

    // --- Chart.js Palette Helper ---
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
            accent: readCssVar('--accent', '#007aff'),
            accentFill: dark ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.08)',
            success: readCssVar('--success', '#34c759'),
            successFill: dark ? 'rgba(52, 199, 89, 0.16)' : 'rgba(52, 199, 89, 0.08)',
            danger: readCssVar('--danger', '#ff3b30'),
            dangerFill: dark ? 'rgba(255, 59, 48, 0.16)' : 'rgba(255, 59, 48, 0.08)',
            warning: readCssVar('--warning', '#ff9500'),
            purple: readCssVar('--purple', '#af52de')
        };
    }

    // --- Global Keyboard & Backdrop Listeners ---
    document.addEventListener('DOMContentLoaded', () => {
        setTheme(currentThemeMode);

        // Close modal on overlay backdrop click (delegated for dynamic modals)
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (
                target &&
                target.classList &&
                target.classList.contains('modal-overlay') &&
                target.classList.contains('active') &&
                !target.classList.contains('forced-login')
            ) {
                closeModal(target.id);
            }
        });

        // Keyboard shortcuts: Esc closes modal, 1-9 switches Dock tabs
        document.addEventListener('keydown', (e) => {
            if (e.isComposing) return;
            if (e.key === 'Escape') {
                closeModal();
                return;
            }
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
                document.querySelector('.modal-overlay.active')
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

    // Expose global AUI API & shorthand functions
    window.AUI = {
        setTheme,
        cycleTheme,
        getThemeMode,
        isDarkEffective,
        onThemeChange,
        switchPage,
        switchSubView,
        openModal,
        closeModal,
        confirm: auiConfirm,
        showToast,
        getChartThemeTokens
    };

    window.cycleTheme = cycleTheme;
    window.switchPage = switchPage;
    window.switchSubView = switchSubView;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.auiConfirm = auiConfirm;
    window.showToast = showToast;

})(window);

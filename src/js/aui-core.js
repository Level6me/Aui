/**
 * AUI Design System — Zero-Dependency Core Runtime (aui-core.js)
 * Provides:
 * 1. Adaptive 3-Mode Theme Engine (auto / light / dark) + OS change listener
 * 2. Floating Glass Dock Page Router + Keyboard Shortcuts (1-9, Esc)
 * 3. Segmented Control & Capsule Switcher Helper
 * 4. Frosted Modal Sheet Controller
 * 5. Top Frosted Toast Pill Notification Engine
 * 6. Chart.js Theme Color Helper
 */

(function (window) {
    'use strict';

    const THEME_STORAGE_KEY = 'aui_theme_mode';
    const THEME_MODES = ['auto', 'light', 'dark'];
    const THEME_ICONS = { auto: '🌓', light: '☀️', dark: '🌙' };
    const THEME_LABELS = { auto: '自动', light: '浅色', dark: '深色' };

    let currentThemeMode = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
    const themeListeners = [];

    function isDarkEffective(mode) {
        const m = mode || currentThemeMode;
        if (m === 'dark') return true;
        if (m === 'light') return false;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function setTheme(mode) {
        if (!THEME_MODES.includes(mode)) mode = 'auto';
        currentThemeMode = mode;
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        document.documentElement.setAttribute('data-theme', mode);

        const iconEl = document.getElementById('theme-icon');
        const labelEl = document.getElementById('theme-label');
        if (iconEl) iconEl.textContent = THEME_ICONS[mode];
        if (labelEl) labelEl.textContent = THEME_LABELS[mode];

        const dark = isDarkEffective(mode);
        themeListeners.forEach(fn => {
            try { fn(dark, mode); } catch (e) { console.error(e); }
        });
    }

    function cycleTheme() {
        const nextIdx = (THEME_MODES.indexOf(currentThemeMode) + 1) % THEME_MODES.length;
        setTheme(THEME_MODES[nextIdx]);
    }

    function onThemeChange(callback) {
        if (typeof callback === 'function') themeListeners.push(callback);
    }

    // Listen to OS dark mode changes when in 'auto' mode
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentThemeMode === 'auto') {
                setTheme('auto');
            }
        });
    }

    // --- Dock Page Navigation ---
    function switchPage(pageId, title, btnEl) {
        document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');

        if (btnEl) {
            document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
            btnEl.classList.add('active');
        }

        const titleEl = document.getElementById('page-title');
        if (titleEl && title) titleEl.textContent = title;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Sub-Tab & Segmented Control Helper ---
    function switchSubView(groupSelector, targetId, btnEl, activeClass = 'active') {
        document.querySelectorAll(groupSelector).forEach(el => {
            el.style.display = 'none';
        });
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'block';

        if (btnEl && btnEl.parentElement) {
            Array.from(btnEl.parentElement.children).forEach(sibling => {
                sibling.classList.remove(activeClass, 'accent');
            });
            btnEl.classList.add(activeClass);
        }
    }

    // --- Modal Controller ---
    function openModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('active');
        document.body.classList.add('modal-open');
    }

    function closeModal(id) {
        if (id) {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        } else {
            document.querySelectorAll('.modal-overlay.active').forEach(el => el.classList.remove('active'));
        }
        if (document.querySelectorAll('.modal-overlay.active').length === 0) {
            document.body.classList.remove('modal-open');
        }
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
        const pill = document.createElement('div');
        pill.className = 'toast-pill';
        pill.textContent = message;
        container.appendChild(pill);

        setTimeout(() => {
            pill.style.opacity = '0';
            pill.style.transform = 'translateY(-10px) scale(0.95)';
            pill.style.transition = 'all 0.2s ease';
            setTimeout(() => pill.remove(), 220);
        }, duration);
    }

    // --- Chart.js Palette Helper ---
    function getChartThemeTokens() {
        const dark = isDarkEffective();
        return {
            isDark: dark,
            gridColor: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(120, 120, 128, 0.10)',
            tickColor: dark ? '#98989d' : '#8e8e93',
            accent: '#007aff',
            accentFill: dark ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.08)',
            success: '#34c759',
            successFill: dark ? 'rgba(52, 199, 89, 0.16)' : 'rgba(52, 199, 89, 0.08)',
            danger: '#ff3b30',
            dangerFill: dark ? 'rgba(255, 59, 48, 0.16)' : 'rgba(255, 59, 48, 0.08)',
            warning: '#ff9500',
            purple: '#af52de'
        };
    }

    // --- Global Keyboard & Backdrop Listeners ---
    document.addEventListener('DOMContentLoaded', () => {
        setTheme(currentThemeMode);

        // Close modal on overlay backdrop click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay && !overlay.classList.contains('forced-login')) {
                    closeModal(overlay.id);
                }
            });
        });

        // Keyboard shortcuts: Esc closes modal, 1-6 switches Dock tabs
        document.addEventListener('keydown', (e) => {
            const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (e.key === 'Escape') {
                closeModal();
                return;
            }
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) {
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
        isDarkEffective,
        onThemeChange,
        switchPage,
        switchSubView,
        openModal,
        closeModal,
        showToast,
        getChartThemeTokens
    };

    window.cycleTheme = cycleTheme;
    window.switchPage = switchPage;
    window.switchSubView = switchSubView;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showToast = showToast;

})(window);

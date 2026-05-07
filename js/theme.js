// ============================================================
// THEME — Light/Dark mode with system detection
// ============================================================
import { store } from './state.js';
import { $ } from './ui.js';

const STORAGE_KEY = 'cf_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('theme-toggle');
  if (btn) btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  const icon = $('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '🌙';
}

export function toggleTheme() {
  const next = store.get('theme') === 'dark' ? 'light' : 'dark';
  store.set('theme', next);
  localStorage.setItem(STORAGE_KEY, next);
}

export function getTheme() {
  return store.get('theme');
}

export function initTheme() {
  // Priority: localStorage > system preference > default dark
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    store.set('theme', saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    store.set('theme', prefersDark ? 'dark' : 'light');
  }

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      store.set('theme', e.matches ? 'dark' : 'light');
    }
  });

  // React to state changes
  store.subscribe('theme', applyTheme);
  applyTheme(store.get('theme'));

  // Wire toggle button
  const btn = $('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

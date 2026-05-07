// ============================================================
// ROUTER — Hash-based view switching
// ============================================================
import { store } from './state.js';

const VIEWS = [
  'hash-studio', 'key-generator', 'kdf-engine', 'hmac-signer',
  'aes-cipher', 'jwt-decoder', 'encoders', 'password-analyzer',
  'totp-generator', 'hash-verifier', 'comparator'
];

function getViewFromHash() {
  const hash = window.location.hash.replace('#', '');
  return VIEWS.includes(hash) ? hash : VIEWS[0];
}

function activateView(viewId) {
  // Update sections
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.toggle('active', el.id === viewId);
  });
  // Update nav
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === viewId);
  });
  // Close mobile sidebar
  store.set('sidebarOpen', false);
}

export function navigateTo(viewId) {
  if (!VIEWS.includes(viewId)) return;
  window.location.hash = viewId;
  store.set('activeView', viewId);
}

export function initRouter() {
  // Handle nav clicks
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.view));
  });

  // React to state changes
  store.subscribe('activeView', (viewId) => activateView(viewId));

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    store.set('activeView', getViewFromHash());
  });

  // Handle mobile sidebar
  store.subscribe('sidebarOpen', (open) => {
    document.querySelector('.sidebar')?.classList.toggle('open', open);
    document.querySelector('.sidebar-overlay')?.classList.toggle('visible', open);
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  });

  // Set initial view
  const initial = getViewFromHash();
  store.set('activeView', initial);
}

// ============================================================
// LIB-LOADER — Zero-Trust CDN library system
// ============================================================
import { store } from './state.js';
import { $, showToast } from './ui.js';

const LIBS = {
  bcrypt: {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js',
    integrity: 'sha512-DNI/FJdkfyeuPUal7lDkRVg0mFY2n4IZJJYqPbQWLL0COxLi6G6nmf5gr1vW1Bd4wYC09hOvZVsSclfXxUTU/w==',
    global: 'dcodeIO'
  },
  cryptojs: {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
    integrity: 'sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA==',
    global: 'CryptoJS'
  },
  argon2: {
    url: 'https://cdn.jsdelivr.net/npm/argon2-browser@1.18.0/dist/argon2-bundled.min.js',
    global: 'argon2'
  }
};

function loadScript(libName) {
  return new Promise((resolve, reject) => {
    const lib = LIBS[libName];
    if (document.querySelector(`script[src="${lib.url}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = lib.url;
    if (lib.integrity) { s.integrity = lib.integrity; s.crossOrigin = 'anonymous'; }
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${libName}`));
    document.head.appendChild(s);
  });
}

export function getLibStatus() {
  return store.get('libsLoaded');
}

export async function loadLibraries() {
  const dot = $('zt-dot');
  const txt = $('zt-text');
  if (txt) txt.innerText = 'Loading…';

  try {
    await Promise.all(Object.keys(LIBS).map(loadScript));
    store.set('libsLoaded', true);
    localStorage.setItem('cf_libs', 'true');
    if (dot) dot.className = 'status-dot on';
    if (txt) txt.innerText = 'Libs: ON';
    showToast('External libraries loaded');
    return true;
  } catch (e) {
    // Retry once after 2s
    try {
      await new Promise(r => setTimeout(r, 2000));
      await Promise.all(Object.keys(LIBS).map(loadScript));
      store.set('libsLoaded', true);
      localStorage.setItem('cf_libs', 'true');
      if (dot) dot.className = 'status-dot on';
      if (txt) txt.innerText = 'Libs: ON';
      showToast('External libraries loaded (retry)');
      return true;
    } catch {
      if (txt) txt.innerText = 'Load Failed';
      showToast('Failed to load libraries. Check connection.', 'error');
      return false;
    }
  }
}

export function unloadLibraries() {
  if (confirm('To fully unload libraries, the page will reload. Continue?')) {
    localStorage.setItem('cf_libs', 'false');
    location.reload();
  }
}

export async function toggleZeroTrust() {
  if (!store.get('libsLoaded')) {
    await loadLibraries();
  } else {
    unloadLibraries();
  }
}

export function initLibLoader() {
  // Wire toggle button
  const btn = $('zt-btn');
  if (btn) btn.addEventListener('click', toggleZeroTrust);

  // Auto-load if previously enabled
  if (localStorage.getItem('cf_libs') === 'true') {
    loadLibraries();
  } else {
    const dot = $('zt-dot');
    const txt = $('zt-text');
    if (dot) dot.className = 'status-dot off';
    if (txt) txt.innerText = 'Libs: OFF';
  }
}

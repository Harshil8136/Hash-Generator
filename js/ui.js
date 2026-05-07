// ============================================================
// UI — Shared utilities: toast, modal, copy, debounce
// ============================================================

const $ = (id) => document.getElementById(id);

let toastTimer = null;

export function showToast(message = 'Copied to clipboard', type = '') {
  const t = $('toast');
  if (!t) return;
  t.textContent = message;
  t.className = 'toast visible' + (type ? ` toast-${type}` : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2200);
}

export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) showToast('Copied to clipboard');
      return ok;
    } catch { return false; }
  }
}

export function copyElementText(id) {
  const el = $(id);
  if (!el) return;
  const txt = el.innerText;
  if (!txt || txt.includes('Waiting') || txt.includes('Error') || txt.includes('Loading')) return;
  copyToClipboard(txt);
}

export function toggleModal(id) {
  const m = $(id);
  if (m) m.classList.toggle('open');
}

export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

export { $ };

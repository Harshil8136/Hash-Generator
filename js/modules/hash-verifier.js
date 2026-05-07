// ============================================================
// HASH VERIFIER — Verify hash integrity
// ============================================================
import { $, bytesToHex, showToast } from '../ui.js';
import { addHistoryEntry } from '../history.js';

const ALGOS = { 'SHA-256': 'SHA-256', 'SHA-512': 'SHA-512' };

async function computeHash(algo, data) {
  const buffer = (typeof data === 'string') ? new TextEncoder().encode(data) : data;
  const res = await crypto.subtle.digest(algo, buffer);
  return bytesToHex(new Uint8Array(res));
}

// Constant-time comparison (educational — JS isn't truly constant-time, but demonstrates the concept)
function secureCompare(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verify() {
  const input = $('verify-input')?.value;
  const expected = $('verify-expected')?.value?.trim().toLowerCase();
  const algo = $('verify-algo')?.value || 'SHA-256';
  const resultEl = $('verify-result');
  const computedEl = $('verify-computed');

  if (!input || !expected) {
    if (resultEl) { resultEl.className = 'verify-result'; resultEl.innerHTML = ''; }
    if (computedEl) computedEl.innerText = '';
    return;
  }

  const computed = await computeHash(algo, input);
  if (computedEl) computedEl.innerText = computed;

  const match = secureCompare(computed, expected);

  if (resultEl) {
    resultEl.className = `verify-result ${match ? 'match' : 'mismatch'}`;
    resultEl.innerHTML = match
      ? '<span class="verify-icon">✓</span> Hash Match — Integrity Verified'
      : '<span class="verify-icon">✗</span> Hash Mismatch — Data May Be Altered';
  }

  addHistoryEntry('Hash Verifier', `${algo} ${match ? 'MATCH' : 'MISMATCH'}`, computed.slice(0, 32) + '…');
}

function handleVerifyFile(file) {
  if (!file) return;
  const info = $('verify-file-info');
  if (info) info.innerText = `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  const r = new FileReader();
  r.onload = async (e) => {
    const algo = $('verify-algo')?.value || 'SHA-256';
    const computed = await computeHash(algo, e.target.result);
    const computedEl = $('verify-computed');
    if (computedEl) computedEl.innerText = computed;

    const expected = $('verify-expected')?.value?.trim().toLowerCase();
    if (expected) {
      const match = secureCompare(computed, expected);
      const resultEl = $('verify-result');
      if (resultEl) {
        resultEl.className = `verify-result ${match ? 'match' : 'mismatch'}`;
        resultEl.innerHTML = match
          ? '<span class="verify-icon">✓</span> File Hash Match'
          : '<span class="verify-icon">✗</span> File Hash Mismatch';
      }
    }
  };
  r.readAsArrayBuffer(file);
}

export function initHashVerifier() {
  $('verify-input')?.addEventListener('input', verify);
  $('verify-expected')?.addEventListener('input', verify);
  $('verify-algo')?.addEventListener('change', verify);

  // File input
  const fi = $('verify-file-input');
  if (fi) fi.addEventListener('change', (e) => handleVerifyFile(e.target.files[0]));
  $('btn-verify-file')?.addEventListener('click', () => fi?.click());
}

// ============================================================
// ENCODERS — Base64, URL, Hex, Base32, HTML entity encode/decode
// ============================================================
import { $, copyToClipboard, showToast } from '../ui.js';
import { addHistoryEntry } from '../history.js';

const B32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(bytes) {
  let bits = '', result = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    result += B32_CHARS[parseInt(chunk, 2)];
  }
  while (result.length % 8 !== 0) result += '=';
  return result;
}

function base32Decode(str) {
  const clean = str.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (const c of clean) {
    const idx = B32_CHARS.indexOf(c);
    if (idx === -1) return null;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new Uint8Array(bytes);
}

function safeBase64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function safeBase64Decode(b64) {
  try { return decodeURIComponent(escape(atob(b64))); } catch { return '[Invalid Base64]'; }
}

function hexEncode(str) {
  return [...new TextEncoder().encode(str)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexDecode(hex) {
  try {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch { return '[Invalid Hex]'; }
}

function htmlEncode(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function htmlDecode(str) {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || '';
}

function runEncoders() {
  const input = $('enc-input')?.value || '';
  const isDecodeMode = $('enc-direction')?.dataset.mode === 'decode';

  if (isDecodeMode) {
    const b64 = $('out-b64'); if (b64) b64.innerText = input ? safeBase64Decode(input) : '';
    const url = $('out-url'); if (url) url.innerText = input ? (() => { try { return decodeURIComponent(input); } catch { return '[Invalid URL encoding]'; } })() : '';
    const hex = $('out-hex'); if (hex) hex.innerText = input ? hexDecode(input) : '';
    const b32 = $('out-b32'); if (b32) { const d = base32Decode(input); b32.innerText = d ? new TextDecoder().decode(d) : (input ? '[Invalid Base32]' : ''); }
    const htm = $('out-html'); if (htm) htm.innerText = input ? htmlDecode(input) : '';
  } else {
    const b64 = $('out-b64'); if (b64) b64.innerText = input ? safeBase64Encode(input) : '';
    const url = $('out-url'); if (url) url.innerText = input ? encodeURIComponent(input) : '';
    const hex = $('out-hex'); if (hex) hex.innerText = input ? hexEncode(input) : '';
    const b32 = $('out-b32'); if (b32) b32.innerText = input ? base32Encode(new TextEncoder().encode(input)) : '';
    const htm = $('out-html'); if (htm) htm.innerText = input ? htmlEncode(input) : '';
  }

  if (input) addHistoryEntry('Encoders', input.slice(0, 40), isDecodeMode ? 'Decode' : 'Encode');
}

function toggleDirection() {
  const btn = $('enc-direction');
  if (!btn) return;
  const current = btn.dataset.mode || 'encode';
  const next = current === 'encode' ? 'decode' : 'encode';
  btn.dataset.mode = next;
  btn.innerText = next === 'encode' ? 'Encode →' : '← Decode';
  const label = $('enc-input-label');
  if (label) label.innerText = next === 'encode' ? 'Plaintext Input' : 'Encoded Input';
  runEncoders();
}

export function initEncoders() {
  $('enc-input')?.addEventListener('input', runEncoders);
  $('enc-direction')?.addEventListener('click', toggleDirection);

  document.querySelectorAll('[data-copy-enc]').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard($(btn.dataset.copyEnc)?.innerText));
  });
}

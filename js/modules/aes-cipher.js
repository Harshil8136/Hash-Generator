// ============================================================
// AES CIPHER — AES-256-GCM encrypt/decrypt via WebCrypto
// ============================================================
import { $, debounce, copyToClipboard, showToast, bytesToHex } from '../ui.js';
import { addHistoryEntry } from '../history.js';

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((s, b) => s + b.byteLength, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) { result.set(new Uint8Array(b), offset); offset += b.byteLength; }
  return result;
}

function toBase64(bytes) {
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}

function fromBase64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function encrypt() {
  const plaintext = $('aes-input')?.value;
  const password = $('aes-password')?.value;
  const out = $('aes-output');
  const meta = $('aes-meta');
  if (!plaintext || !password) { if (out) out.innerText = 'Enter plaintext and password'; return; }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
    const packed = concatBuffers(salt.buffer, iv.buffer, ciphertext);
    const result = toBase64(packed);

    if (out) out.innerText = result;
    if (meta) meta.innerHTML = `
      <div class="cipher-meta-item">Salt: <span>${bytesToHex(salt)}</span></div>
      <div class="cipher-meta-item">IV: <span>${bytesToHex(iv)}</span></div>
      <div class="cipher-meta-item">Key derivation: PBKDF2-SHA256 × 100k</div>
    `;
    addHistoryEntry('AES Cipher', 'Encrypt', result.slice(0, 40) + '…');
  } catch (e) {
    if (out) out.innerText = 'Encryption error: ' + e.message;
  }
}

async function decrypt() {
  const cipherB64 = $('aes-input')?.value;
  const password = $('aes-password')?.value;
  const out = $('aes-output');
  const meta = $('aes-meta');
  if (!cipherB64 || !password) { if (out) out.innerText = 'Enter ciphertext and password'; return; }

  try {
    const packed = fromBase64(cipherB64);
    const salt = packed.slice(0, 16);
    const iv = packed.slice(16, 28);
    const ciphertext = packed.slice(28);
    const key = await deriveKey(password, salt);
    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    const result = new TextDecoder().decode(plainBuffer);

    if (out) out.innerText = result;
    if (meta) meta.innerHTML = `
      <div class="cipher-meta-item">Salt: <span>${bytesToHex(salt)}</span></div>
      <div class="cipher-meta-item">IV: <span>${bytesToHex(iv)}</span></div>
      <div class="cipher-meta-item">Decrypted successfully ✓</div>
    `;
    addHistoryEntry('AES Cipher', 'Decrypt', result.slice(0, 40));
  } catch {
    if (out) out.innerText = 'Decryption failed — wrong password or corrupted data';
    if (meta) meta.innerHTML = '';
  }
}

function setAESMode(mode) {
  const encTab = $('aes-tab-enc');
  const decTab = $('aes-tab-dec');
  if (encTab) encTab.classList.toggle('active', mode === 'encrypt');
  if (decTab) decTab.classList.toggle('active', mode === 'decrypt');

  const label = $('aes-input-label');
  const placeholder = $('aes-input');
  if (mode === 'encrypt') {
    if (label) label.innerText = 'Plaintext';
    if (placeholder) placeholder.placeholder = 'Enter text to encrypt…';
  } else {
    if (label) label.innerText = 'Ciphertext (Base64)';
    if (placeholder) placeholder.placeholder = 'Paste encrypted Base64 string…';
  }

  const out = $('aes-output'); if (out) out.innerText = '';
  const meta = $('aes-meta'); if (meta) meta.innerHTML = '';
}

export function initAESCipher() {
  $('aes-tab-enc')?.addEventListener('click', () => setAESMode('encrypt'));
  $('aes-tab-dec')?.addEventListener('click', () => setAESMode('decrypt'));

  $('btn-aes-run')?.addEventListener('click', () => {
    const isEncrypt = $('aes-tab-enc')?.classList.contains('active');
    isEncrypt ? encrypt() : decrypt();
  });

  $('btn-aes-copy')?.addEventListener('click', () => {
    copyToClipboard($('aes-output')?.innerText);
  });
}

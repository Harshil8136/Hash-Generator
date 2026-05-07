// ============================================================
// HASH STUDIO — SHA-256/512, SHA-3, MD5, RIPEMD-160
// ============================================================
import { store } from '../state.js';
import { $, debounce, copyToClipboard, bytesToHex } from '../ui.js';
import { addHistoryEntry } from '../history.js';

async function nativeHash(algo, data) {
  if (!data) return '';
  const buffer = (typeof data === 'string') ? new TextEncoder().encode(data) : data;
  const res = await crypto.subtle.digest(algo, buffer);
  return bytesToHex(new Uint8Array(res));
}

function libHash(algo, text) {
  if (!store.get('libsLoaded') || typeof CryptoJS === 'undefined' || typeof text !== 'string')
    return 'Libs Disabled / Text Only';
  try {
    if (algo === 'MD5') return CryptoJS.MD5(text).toString();
    if (algo === 'SHA3') return CryptoJS.SHA3(text, { outputLength: 256 }).toString();
    if (algo === 'RIPEMD160') return CryptoJS.RIPEMD160(text).toString();
  } catch { return 'Error'; }
}

async function updateHashStudio(fileData = null) {
  const data = (store.get('hashMode') === 'text') ? $('hash-input')?.value : fileData;
  if (!data && typeof data !== 'object') return;

  const sha256 = await nativeHash('SHA-256', data);
  const sha512 = await nativeHash('SHA-512', data);

  const el256 = $('out-sha256'); if (el256) el256.innerText = sha256;
  const el512 = $('out-sha512'); if (el512) el512.innerText = sha512;

  if (store.get('hashMode') === 'text') {
    const el3 = $('out-sha3'); if (el3) el3.innerText = libHash('SHA3', data);
    const elMd5 = $('out-md5'); if (elMd5) elMd5.innerText = libHash('MD5', data);
    const elRipe = $('out-ripemd'); if (elRipe) elRipe.innerText = libHash('RIPEMD160', data);
  }

  if (sha256 && typeof data === 'string') {
    addHistoryEntry('Hash Studio', data, `SHA-256: ${sha256}`);
  }
}

function setHashMode(mode) {
  store.set('hashMode', mode);
  const modeText = $('mode-text');
  const modeFile = $('mode-file');
  const tabText = $('tab-text');
  const tabFile = $('tab-file');
  if (modeText) modeText.classList.toggle('hidden', mode !== 'text');
  if (modeFile) modeFile.classList.toggle('hidden', mode !== 'file');
  if (tabText) tabText.classList.toggle('active', mode === 'text');
  if (tabFile) tabFile.classList.toggle('active', mode === 'file');
  ['out-sha256', 'out-sha512', 'out-sha3', 'out-md5', 'out-ripemd'].forEach(id => {
    const el = $(id); if (el) el.innerText = '';
  });
}

function copyHashCLI(algo) {
  const input = $('hash-input')?.value || 'INPUT_TEXT';
  const safe = input.replace(/"/g, '\\"');
  const map = { 'SHA-256': 'sha256', 'SHA-512': 'sha512', 'SHA-3': 'sha3-256', 'MD5': 'md5', 'RIPEMD-160': 'ripemd160' };
  const nodeAlgo = map[algo] || algo.toLowerCase();
  copyToClipboard(`node -e "console.log(require('crypto').createHash('${nodeAlgo}').update(process.argv[1]).digest('hex'))" "${safe}"`);
}

function handleFile(file) {
  if (!file) return;
  const info = $('file-info');
  if (info) info.innerText = `Loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  const r = new FileReader();
  r.onload = (e) => updateHashStudio(e.target.result);
  r.readAsArrayBuffer(file);
}

function downloadReport() {
  let c = 'CRYPTOFORGE PRO — HASH REPORT\n' + '='.repeat(40) + '\n\n';
  c += `Timestamp: ${new Date().toISOString()}\n`;
  c += `Mode: ${store.get('hashMode')}\n\n`;
  c += `SHA-256:    ${$('out-sha256')?.innerText || 'N/A'}\n`;
  c += `SHA-512:    ${$('out-sha512')?.innerText || 'N/A'}\n`;
  if (store.get('libsLoaded')) {
    c += `SHA-3:      ${$('out-sha3')?.innerText || 'N/A'}\n`;
    c += `MD5:        ${$('out-md5')?.innerText || 'N/A'}\n`;
    c += `RIPEMD-160: ${$('out-ripemd')?.innerText || 'N/A'}\n`;
  }
  const blob = new Blob([c], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cryptoforge-report-${Date.now()}.txt`;
  a.click();
}

export function initHashStudio() {
  const input = $('hash-input');
  if (input) {
    input.addEventListener('input', debounce(() => updateHashStudio()));
    input.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'Enter') updateHashStudio(); });
  }

  // Tab switching
  $('tab-text')?.addEventListener('click', () => setHashMode('text'));
  $('tab-file')?.addEventListener('click', () => setHashMode('file'));

  // File drop zone
  const dz = $('drop-zone');
  const fi = $('file-input');
  if (dz && fi) {
    dz.addEventListener('click', () => fi.click());
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
    fi.addEventListener('change', (e) => handleFile(e.target.files[0]));
  }

  // Copy & CLI buttons
  document.querySelectorAll('[data-copy-hash]').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard($(btn.dataset.copyHash)?.innerText));
  });
  document.querySelectorAll('[data-cli-hash]').forEach(btn => {
    btn.addEventListener('click', () => copyHashCLI(btn.dataset.cliHash));
  });

  // Report
  $('btn-download-report')?.addEventListener('click', downloadReport);

  // Re-run on libs load
  store.subscribe('libsLoaded', () => updateHashStudio());
}

// ============================================================
// KEY GENERATOR — CSPRNG keys, UUID
// ============================================================
import { $, copyToClipboard, bytesToHex, bytesToBase64 } from '../ui.js';
import { addHistoryEntry } from '../history.js';

function genKey(bytes, format, outputId) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  let result = '';
  if (format === 'hex') result = bytesToHex(arr);
  else if (format === 'b64') result = bytesToBase64(arr);
  const el = $(outputId);
  if (el) el.innerText = result;
  return result;
}

function genUUID() {
  const uuid = crypto.randomUUID();
  const el = $('out-gen-uuid');
  if (el) el.innerText = uuid;
  return uuid;
}

function copyKeyCLI(type) {
  const cmds = {
    enc: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
    hex: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
    uuid: `node -e "console.log(require('crypto').randomUUID())"`
  };
  copyToClipboard(cmds[type] || '');
}

function generateAll() {
  const k1 = genKey(32, 'b64', 'out-gen-enc');
  const k2 = genKey(32, 'hex', 'out-gen-hex');
  const k3 = genUUID();
  addHistoryEntry('Key Generator', 'Batch generation', `Key: ${k1?.slice(0, 20)}…`);
}

export function initKeyGenerator() {
  $('btn-gen-enc')?.addEventListener('click', () => {
    const r = genKey(32, 'b64', 'out-gen-enc');
    addHistoryEntry('Key Generator', '256-bit Base64', r);
  });
  $('btn-gen-hex')?.addEventListener('click', () => {
    const r = genKey(32, 'hex', 'out-gen-hex');
    addHistoryEntry('Key Generator', '256-bit Hex', r);
  });
  $('btn-gen-uuid')?.addEventListener('click', () => {
    const r = genUUID();
    addHistoryEntry('Key Generator', 'UUID v4', r);
  });
  $('btn-gen-all')?.addEventListener('click', generateAll);

  // Copy buttons
  document.querySelectorAll('[data-copy-key]').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard($(btn.dataset.copyKey)?.innerText));
  });
  document.querySelectorAll('[data-cli-key]').forEach(btn => {
    btn.addEventListener('click', () => copyKeyCLI(btn.dataset.cliKey));
  });

  // Generate initial values
  generateAll();
}

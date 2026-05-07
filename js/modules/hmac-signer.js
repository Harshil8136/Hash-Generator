// ============================================================
// HMAC SIGNER — HMAC-SHA256/384/512 (FIX: was missing listeners)
// ============================================================
import { $, debounce, copyToClipboard, bytesToHex } from '../ui.js';
import { addHistoryEntry } from '../history.js';

async function computeHMAC(algorithm, key, payload) {
  if (!key || !payload) return '';
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: algorithm }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(payload));
  return bytesToHex(new Uint8Array(sig));
}

async function updateHMAC() {
  const key = $('hmac-key')?.value;
  const payload = $('hmac-payload')?.value;
  if (!key || !payload) {
    ['out-hmac256', 'out-hmac384', 'out-hmac512'].forEach(id => {
      const el = $(id); if (el) el.innerText = '';
    });
    return;
  }

  const [h256, h384, h512] = await Promise.all([
    computeHMAC('SHA-256', key, payload),
    computeHMAC('SHA-384', key, payload),
    computeHMAC('SHA-512', key, payload)
  ]);

  const e256 = $('out-hmac256'); if (e256) e256.innerText = h256;
  const e384 = $('out-hmac384'); if (e384) e384.innerText = h384;
  const e512 = $('out-hmac512'); if (e512) e512.innerText = h512;

  addHistoryEntry('HMAC Signer', `Key: ${key.slice(0, 8)}…`, `SHA-256: ${h256.slice(0, 32)}…`);
}

function copyHmacCLI(algo) {
  const key = $('hmac-key')?.value || 'SECRET_KEY';
  const payload = $('hmac-payload')?.value || 'PAYLOAD';
  const safeKey = key.replace(/"/g, '\\"');
  const safePayload = payload.replace(/"/g, '\\"');
  const nodeAlgo = algo.toLowerCase().replace('-', '');
  copyToClipboard(
    `node -e "console.log(require('crypto').createHmac('${nodeAlgo}', '${safeKey}').update('${safePayload}').digest('hex'))"`
  );
}

export function initHMACSigner() {
  const keyInput = $('hmac-key');
  const payloadInput = $('hmac-payload');
  const debouncedUpdate = debounce(() => updateHMAC());

  if (keyInput) keyInput.addEventListener('input', debouncedUpdate);
  if (payloadInput) payloadInput.addEventListener('input', debouncedUpdate);

  // Copy buttons
  document.querySelectorAll('[data-copy-hmac]').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard($(btn.dataset.copyHmac)?.innerText));
  });
  document.querySelectorAll('[data-cli-hmac]').forEach(btn => {
    btn.addEventListener('click', () => copyHmacCLI(btn.dataset.cliHmac));
  });
}

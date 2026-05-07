// ============================================================
// KDF ENGINE — Bcrypt (Worker), PBKDF2 (Native), Argon2 (WASM)
// ============================================================
import { store } from '../state.js';
import { $, debounce, bytesToHex } from '../ui.js';
import { addHistoryEntry } from '../history.js';

let bcryptWorker = null;

function initBcryptWorker() {
  if (!store.get('libsLoaded') || bcryptWorker) return;
  const code = `
    self.onmessage = function(e) {
      if (e.data.cmd === 'hash') {
        try {
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js');
          const t0 = performance.now();
          const salt = dcodeIO.bcrypt.genSaltSync(e.data.cost);
          const hash = dcodeIO.bcrypt.hashSync(e.data.pwd, salt);
          const ms = Math.round(performance.now() - t0);
          self.postMessage({ ok: true, hash, ms, salt });
        } catch (err) { self.postMessage({ ok: false, err: err.toString() }); }
      }
    };
  `;
  const blob = new Blob([code], { type: 'application/javascript' });
  bcryptWorker = new Worker(URL.createObjectURL(blob));
  bcryptWorker.onmessage = (e) => {
    const out = $('out-kdf');
    const stat = $('kdf-status');
    const time = $('kdf-time');
    if (e.data.ok) {
      if (out) out.innerText = e.data.hash;
      if (stat) stat.innerText = 'Worker Idle';
      if (time) time.innerText = `${e.data.ms}ms`;
      addHistoryEntry('Key Derivation', `Bcrypt cost=${store.get('currentCost')}`, e.data.hash);
    } else {
      if (out) out.innerText = 'Error: ' + e.data.err;
    }
  };
}

async function runPBKDF2(pass, cost) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltDisplay = $('kdf-salt');
  if (saltDisplay) saltDisplay.innerText = bytesToHex(salt);

  const t0 = performance.now();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: cost * 1000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const ms = Math.round(performance.now() - t0);
  const time = $('kdf-time');
  if (time) time.innerText = `${ms}ms`;
  return bytesToHex(new Uint8Array(bits));
}

async function runArgon2(pass, cost) {
  if (!window.argon2) return 'Argon2 lib not loaded';
  try {
    const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const saltDisplay = $('kdf-salt');
    if (saltDisplay) saltDisplay.innerText = salt;

    const timeCost = Math.max(1, Math.floor(cost / 4));
    const t0 = performance.now();
    const hash = await argon2.hash({
      pass, salt, time: timeCost, mem: 1024, parallelism: 1, type: argon2.Argon2id
    });
    const ms = Math.round(performance.now() - t0);
    const time = $('kdf-time');
    if (time) time.innerText = `${ms}ms`;
    return hash.encoded;
  } catch (e) { return 'Argon2 Error: ' + e; }
}

async function runKDF() {
  const pwd = $('pwd-input')?.value;
  const out = $('out-kdf');
  const stat = $('kdf-status');
  if (!pwd) { if (out) out.innerText = 'Waiting for input…'; return; }
  if (out) out.innerText = 'Calculating…';

  const mode = store.get('kdfMode');
  const cost = store.get('currentCost');

  if (mode === 'bcrypt') {
    if (!store.get('libsLoaded')) { if (out) out.innerText = 'Enable Libs for Bcrypt'; return; }
    if (stat) stat.innerText = 'Worker Running…';
    if (!bcryptWorker) initBcryptWorker();
    bcryptWorker?.postMessage({ cmd: 'hash', pwd, cost });
  } else if (mode === 'pbkdf2') {
    const res = await runPBKDF2(pwd, cost);
    if (out) out.innerText = res;
    addHistoryEntry('Key Derivation', `PBKDF2 iter=${cost * 1000}`, res);
  } else if (mode === 'argon2') {
    if (!store.get('libsLoaded')) { if (out) out.innerText = 'Enable Libs for Argon2'; return; }
    const res = await runArgon2(pwd, cost);
    if (out) out.innerText = res;
    addHistoryEntry('Key Derivation', `Argon2id t=${Math.floor(cost / 4)}`, res);
  }
}

function setKDF(mode) {
  store.set('kdfMode', mode);
  document.querySelectorAll('#kdf-engine .inner-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.kdf === mode);
  });
  const label = $('kdf-label');
  if (label) label.innerText = mode.toUpperCase();
  runKDF();
}

function setThreat(cost, el) {
  document.querySelectorAll('.threat-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
  store.set('currentCost', cost);

  const explain = $('threat-explain');
  if (!explain) return;
  const texts = {
    10: '<strong>Cost 10:</strong> Light hashing (~100ms). Suitable for development environments.',
    12: '<strong>Cost 12:</strong> Standard hashing (~500ms). Recommended for most identity systems.',
    14: '<strong>Cost 14:</strong> Heavy hashing (~1.5s). Use for root accounts or financial data.'
  };
  explain.innerHTML = texts[cost] || '';
  runKDF();
}

export function initKDFEngine() {
  const pwd = $('pwd-input');
  if (pwd) pwd.addEventListener('input', debounce(() => runKDF()));

  // KDF tabs
  document.querySelectorAll('[data-kdf]').forEach(el => {
    el.addEventListener('click', () => setKDF(el.dataset.kdf));
  });

  // Threat cards
  document.querySelectorAll('.threat-card').forEach(el => {
    el.addEventListener('click', () => setThreat(parseInt(el.dataset.cost), el));
  });

  // Init bcrypt worker when libs load
  store.subscribe('libsLoaded', (loaded) => { if (loaded) initBcryptWorker(); });
}

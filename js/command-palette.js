// ============================================================
// COMMAND PALETTE — Ctrl+K / Cmd+K fuzzy search
// ============================================================
import { navigateTo } from './router.js';
import { $ } from './ui.js';

const COMMANDS = [
  { name: 'Hash Studio', desc: 'SHA-256, SHA-512, SHA-3, MD5', view: 'hash-studio', keywords: 'hash sha md5 checksum digest' },
  { name: 'Key Generator', desc: 'CSPRNG keys, UUID, random bytes', view: 'key-generator', keywords: 'key random uuid csprng generate' },
  { name: 'Key Derivation', desc: 'Bcrypt, PBKDF2, Argon2', view: 'kdf-engine', keywords: 'password kdf bcrypt pbkdf2 argon2 derive' },
  { name: 'HMAC Signer', desc: 'HMAC-SHA256/384/512 signing', view: 'hmac-signer', keywords: 'hmac sign signature authenticate webhook' },
  { name: 'AES Cipher', desc: 'AES-256-GCM encrypt/decrypt', view: 'aes-cipher', keywords: 'aes encrypt decrypt cipher symmetric' },
  { name: 'JWT Decoder', desc: 'Decode & inspect JSON Web Tokens', view: 'jwt-decoder', keywords: 'jwt token decode json web' },
  { name: 'Encode / Decode', desc: 'Base64, URL, Hex, Base32, HTML', view: 'encoders', keywords: 'encode decode base64 url hex base32 html entity' },
  { name: 'Password Analyzer', desc: 'Strength, entropy, crack time', view: 'password-analyzer', keywords: 'password strength entropy analyze crack' },
  { name: 'TOTP Generator', desc: 'RFC 6238 time-based OTP', view: 'totp-generator', keywords: 'totp otp 2fa authenticator code time' },
  { name: 'Hash Verifier', desc: 'Verify hash integrity', view: 'hash-verifier', keywords: 'verify check integrity compare validate' },
  { name: 'Avalanche Analyzer', desc: 'Visual bit-diff comparison', view: 'comparator', keywords: 'avalanche compare diff bit visualize' },
];

let selectedIndex = 0;
let isOpen = false;

function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  return t.includes(q);
}

function render(query = '') {
  const results = $('palette-results');
  if (!results) return;

  const filtered = query
    ? COMMANDS.filter(c => fuzzyMatch(query, c.name + ' ' + c.desc + ' ' + c.keywords))
    : COMMANDS;

  selectedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));

  if (filtered.length === 0) {
    results.innerHTML = '<div class="palette-empty">No results found</div>';
    return;
  }

  results.innerHTML = filtered.map((cmd, i) => `
    <div class="palette-item${i === selectedIndex ? ' selected' : ''}" data-view="${cmd.view}">
      <span>${cmd.name}</span>
      <span style="color:var(--color-text-tertiary);font-size:var(--text-xs)">${cmd.desc}</span>
    </div>
  `).join('');

  // Click handlers
  results.querySelectorAll('.palette-item').forEach(el => {
    el.addEventListener('click', () => {
      navigateTo(el.dataset.view);
      closePalette();
    });
  });

  // Scroll selected into view
  const sel = results.querySelector('.palette-item.selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function openPalette() {
  const overlay = $('command-palette');
  if (!overlay) return;
  isOpen = true;
  selectedIndex = 0;
  overlay.classList.add('open');
  const input = $('palette-input');
  if (input) { input.value = ''; input.focus(); }
  render();
}

function closePalette() {
  const overlay = $('command-palette');
  if (!overlay) return;
  isOpen = false;
  overlay.classList.remove('open');
}

export function initCommandPalette() {
  // Keyboard shortcut: Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      isOpen ? closePalette() : openPalette();
    }
    if (e.key === 'Escape' && isOpen) {
      closePalette();
    }
  });

  // Input filtering
  const input = $('palette-input');
  if (input) {
    input.addEventListener('input', () => {
      selectedIndex = 0;
      render(input.value);
    });
    input.addEventListener('keydown', (e) => {
      const results = $('palette-results');
      const items = results ? results.querySelectorAll('.palette-item') : [];
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, items.length - 1); render(input.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); render(input.value); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const sel = items[selectedIndex];
        if (sel) { navigateTo(sel.dataset.view); closePalette(); }
      }
    });
  }

  // Click overlay to close
  const overlay = $('command-palette');
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closePalette(); });
}

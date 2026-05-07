// ============================================================
// TOTP GENERATOR — RFC 6238 time-based OTP
// ============================================================
import { $, copyToClipboard, bytesToHex } from '../ui.js';
import { addHistoryEntry } from '../history.js';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(str) {
  const clean = str.replace(/[\s=]+/g, '').toUpperCase();
  let bits = '';
  for (const c of clean) {
    const i = B32.indexOf(c);
    if (i === -1) return null;
    bits += i.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new Uint8Array(bytes);
}

function base32Encode(bytes) {
  let bits = '', result = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  for (let i = 0; i < bits.length; i += 5) {
    result += B32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  }
  return result;
}

async function hmacSHA1(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(sig);
}

function intToBytes(num) {
  const bytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = Math.floor(num / 256);
  }
  return bytes;
}

async function generateTOTP(secret, period = 30, digits = 6) {
  const key = base32Decode(secret);
  if (!key) return { code: 'INVALID', remaining: 0 };

  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / period);
  const remaining = period - (epoch % period);

  const counterBytes = intToBytes(counter);
  const hmac = await hmacSHA1(key, counterBytes);

  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  const code = otp.toString().padStart(digits, '0');

  return { code, remaining };
}

function generateSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return base32Encode(bytes);
}

let totpInterval = null;

async function updateTOTP() {
  const secret = $('totp-secret')?.value?.trim();
  const codeEl = $('totp-code');
  const barFill = $('totp-bar-fill');
  const countdownText = $('totp-countdown-text');

  if (!secret) {
    if (codeEl) codeEl.innerText = '------';
    if (barFill) barFill.style.width = '0%';
    if (countdownText) countdownText.innerText = '--';
    return;
  }

  const period = parseInt($('totp-period')?.value || '30');
  const digits = parseInt($('totp-digits')?.value || '6');

  const { code, remaining } = await generateTOTP(secret, period, digits);

  if (codeEl) {
    // Format with space in middle: "123 456"
    const mid = Math.floor(code.length / 2);
    codeEl.innerText = code.slice(0, mid) + ' ' + code.slice(mid);
  }
  if (barFill) barFill.style.width = `${(remaining / period) * 100}%`;
  if (countdownText) countdownText.innerText = `${remaining}s`;

  // Update URI
  const uri = $('totp-uri');
  if (uri) uri.innerText = `otpauth://totp/CryptoForge:user?secret=${secret}&issuer=CryptoForge&period=${period}&digits=${digits}`;
}

function startTOTPTimer() {
  if (totpInterval) clearInterval(totpInterval);
  updateTOTP();
  totpInterval = setInterval(updateTOTP, 1000);
}

export function initTOTPGenerator() {
  $('totp-secret')?.addEventListener('input', () => startTOTPTimer());
  $('totp-period')?.addEventListener('change', () => startTOTPTimer());
  $('totp-digits')?.addEventListener('change', () => startTOTPTimer());

  $('btn-totp-generate-secret')?.addEventListener('click', () => {
    const secret = generateSecret();
    const el = $('totp-secret');
    if (el) el.value = secret;
    startTOTPTimer();
    addHistoryEntry('TOTP Generator', 'New secret', secret.slice(0, 8) + '…');
  });

  $('btn-totp-copy')?.addEventListener('click', () => {
    const code = $('totp-code')?.innerText?.replace(/\s/g, '');
    if (code && code !== '------') copyToClipboard(code);
  });

  $('btn-totp-copy-uri')?.addEventListener('click', () => {
    copyToClipboard($('totp-uri')?.innerText);
  });
}

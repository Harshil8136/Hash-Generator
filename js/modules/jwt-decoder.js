// ============================================================
// JWT DECODER — Client-side JWT visual parser
// ============================================================
import { $, copyToClipboard } from '../ui.js';
import { addHistoryEntry } from '../history.js';

function base64UrlDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  try { return decodeURIComponent(escape(atob(b64))); } catch { return null; }
}

function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

function timeAgo(ts) {
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;
  if (diff < 0) {
    const ago = Math.abs(diff);
    if (ago < 60) return `${ago}s ago`;
    if (ago < 3600) return `${Math.floor(ago / 60)}m ago`;
    if (ago < 86400) return `${Math.floor(ago / 3600)}h ago`;
    return `${Math.floor(ago / 86400)}d ago`;
  }
  if (diff < 60) return `in ${diff}s`;
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
  return `in ${Math.floor(diff / 86400)}d`;
}

function decodeJWT() {
  const input = $('jwt-input')?.value?.trim();
  const headerEl = $('jwt-header-json');
  const payloadEl = $('jwt-payload-json');
  const sigEl = $('jwt-sig-display');
  const expiryEl = $('jwt-expiry');
  const sectionsEl = $('jwt-sections');

  if (!input) {
    if (sectionsEl) sectionsEl.classList.add('hidden');
    return;
  }

  const parts = input.split('.');
  if (parts.length !== 3) {
    if (headerEl) headerEl.innerText = 'Invalid JWT: expected 3 dot-separated segments';
    if (sectionsEl) sectionsEl.classList.remove('hidden');
    return;
  }

  const headerRaw = base64UrlDecode(parts[0]);
  const payloadRaw = base64UrlDecode(parts[1]);

  if (!headerRaw || !payloadRaw) {
    if (headerEl) headerEl.innerText = 'Failed to decode Base64url segments';
    if (sectionsEl) sectionsEl.classList.remove('hidden');
    return;
  }

  let header, payload;
  try { header = JSON.parse(headerRaw); } catch { header = { error: 'Invalid JSON in header' }; }
  try { payload = JSON.parse(payloadRaw); } catch { payload = { error: 'Invalid JSON in payload' }; }

  if (headerEl) headerEl.innerText = formatJSON(header);
  if (payloadEl) payloadEl.innerText = formatJSON(payload);
  if (sigEl) sigEl.innerText = parts[2];

  // Expiry check
  if (expiryEl) {
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      const expDate = new Date(payload.exp * 1000).toISOString();
      expiryEl.className = `jwt-expiry-badge ${isExpired ? 'expired' : 'valid'}`;
      expiryEl.innerText = isExpired ? `Expired ${timeAgo(payload.exp)}` : `Valid — expires ${timeAgo(payload.exp)}`;
      expiryEl.title = expDate;
    } else {
      expiryEl.className = 'jwt-expiry-badge info';
      expiryEl.innerText = 'No expiration claim';
    }
  }

  if (sectionsEl) sectionsEl.classList.remove('hidden');
  addHistoryEntry('JWT Decoder', `alg: ${header.alg || '?'}`, `sub: ${payload.sub || 'N/A'}`);
}

export function initJWTDecoder() {
  $('jwt-input')?.addEventListener('input', decodeJWT);
  $('btn-jwt-copy-header')?.addEventListener('click', () => copyToClipboard($('jwt-header-json')?.innerText));
  $('btn-jwt-copy-payload')?.addEventListener('click', () => copyToClipboard($('jwt-payload-json')?.innerText));
}

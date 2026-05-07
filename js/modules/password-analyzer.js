// ============================================================
// PASSWORD ANALYZER — Strength, entropy, crack-time estimation
// ============================================================
import { $, debounce } from '../ui.js';

const COMMON_PATTERNS = [
  'password', '123456', 'qwerty', 'letmein', 'welcome', 'admin', 'login',
  'abc123', 'master', 'dragon', 'monkey', 'shadow', 'sunshine', 'trustno1'
];

function getCharsetSize(pw) {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 33;
  return size;
}

function getEntropy(pw) {
  if (!pw) return 0;
  const charset = getCharsetSize(pw);
  return Math.round(pw.length * Math.log2(charset || 1) * 10) / 10;
}

function detectPatterns(pw) {
  const patterns = [];
  const lower = pw.toLowerCase();

  if (COMMON_PATTERNS.some(p => lower.includes(p))) patterns.push('Contains common password');
  if (/(.)\1{2,}/.test(pw)) patterns.push('Repeated characters');
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(lower)) patterns.push('Sequential letters');
  if (/(?:012|123|234|345|456|567|678|789|890)/.test(pw)) patterns.push('Sequential numbers');
  if (/(?:qwert|asdf|zxcv|poiuy|lkjhg|mnbvc)/i.test(lower)) patterns.push('Keyboard walk pattern');
  if (/^[a-zA-Z]+\d+$/.test(pw)) patterns.push('Simple word + number');
  if (pw.length < 8) patterns.push('Too short (< 8 chars)');

  return patterns;
}

function crackTime(entropy) {
  // GPU: 10 billion hashes/sec, State: 1 trillion
  const gpu = Math.pow(2, entropy) / 10e9;
  const state = Math.pow(2, entropy) / 1e12;

  function fmt(seconds) {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
    if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1000)).toFixed(0)}K years`;
    return `${(seconds / (86400 * 365 * 1e6)).toFixed(0)}M+ years`;
  }

  return { gpu: fmt(gpu), state: fmt(state) };
}

function getScore(entropy, patterns) {
  let score = 0;
  if (entropy >= 20) score = 1;
  if (entropy >= 40) score = 2;
  if (entropy >= 60) score = 3;
  if (entropy >= 80) score = 4;
  if (patterns.length > 2) score = Math.max(0, score - 1);
  return score;
}

const LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const COLORS = ['var(--color-danger)', 'var(--color-danger)', 'var(--color-warning)', 'var(--emerald-400)', 'var(--color-secure)'];

function analyze() {
  const pw = $('pw-analyze-input')?.value || '';
  const entropy = getEntropy(pw);
  const patterns = detectPatterns(pw);
  const crack = crackTime(entropy);
  const score = getScore(entropy, patterns);
  const charset = getCharsetSize(pw);

  // Meter
  const fill = $('pw-meter-fill');
  if (fill) { fill.dataset.score = score; }

  // Label
  const label = $('pw-strength-label');
  if (label) { label.innerText = pw ? LABELS[score] : '—'; label.style.color = pw ? COLORS[score] : ''; }

  // Cards
  const eEnt = $('pw-entropy'); if (eEnt) eEnt.innerText = pw ? `${entropy} bits` : '—';
  const eChar = $('pw-charset'); if (eChar) eChar.innerText = pw ? `${charset} chars` : '—';
  const eLen = $('pw-length'); if (eLen) eLen.innerText = pw ? `${pw.length}` : '—';
  const eGpu = $('pw-crack-gpu'); if (eGpu) eGpu.innerText = pw ? crack.gpu : '—';
  const eState = $('pw-crack-state'); if (eState) eState.innerText = pw ? crack.state : '—';

  // Patterns
  const pList = $('pw-patterns');
  if (pList) {
    if (!pw || patterns.length === 0) {
      pList.innerHTML = pw ? '<li style="color:var(--color-secure)">No common patterns detected ✓</li>' : '';
    } else {
      pList.innerHTML = patterns.map(p => `<li style="color:var(--color-warning)">⚠ ${p}</li>`).join('');
    }
  }

  // Suggestions
  const sList = $('pw-suggestions');
  if (sList && pw) {
    const sugs = [];
    if (!/[A-Z]/.test(pw)) sugs.push('Add uppercase letters');
    if (!/[0-9]/.test(pw)) sugs.push('Add numbers');
    if (!/[^a-zA-Z0-9]/.test(pw)) sugs.push('Add special characters (!@#$%)');
    if (pw.length < 12) sugs.push('Increase length to 12+ characters');
    if (pw.length < 16 && score < 4) sugs.push('Use 16+ characters for maximum security');
    sList.innerHTML = sugs.length
      ? sugs.map(s => `<li>${s}</li>`).join('')
      : '<li style="color:var(--color-secure)">Password meets strong criteria ✓</li>';
  }
}

export function initPasswordAnalyzer() {
  $('pw-analyze-input')?.addEventListener('input', debounce(analyze, 150));
}

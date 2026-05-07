// ============================================================
// COMPARATOR — Avalanche Effect Visualizer
// ============================================================
import { $, bytesToHex } from '../ui.js';

function hexToBinary(hex) {
  return hex.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
}

async function hashSHA256(data) {
  if (!data) return '';
  const buffer = new TextEncoder().encode(data);
  const res = await crypto.subtle.digest('SHA-256', buffer);
  return bytesToHex(new Uint8Array(res));
}

async function runCompare() {
  const a = $('comp-a')?.value;
  const b = $('comp-b')?.value;
  const grid = $('bit-grid');
  const pct = $('diff-pct');

  if (!a || !b || !grid) {
    if (grid) grid.innerHTML = '';
    if (pct) pct.innerText = '0%';
    return;
  }

  const hashA = await hashSHA256(a);
  const hashB = await hashSHA256(b);
  const binA = hexToBinary(hashA);
  const binB = hexToBinary(hashB);

  // Display hashes
  const hA = $('comp-hash-a'); if (hA) hA.innerText = hashA;
  const hB = $('comp-hash-b'); if (hB) hB.innerText = hashB;

  grid.innerHTML = '';
  let diffCount = 0;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < 256; i++) {
    const bit = document.createElement('div');
    bit.className = 'bit';
    if (binA[i] !== binB[i]) {
      bit.classList.add('diff');
      diffCount++;
    } else if (binA[i] === '1') {
      bit.classList.add('active');
    }
    // Stagger animation
    bit.style.animationDelay = `${i * 2}ms`;
    frag.appendChild(bit);
  }

  grid.appendChild(frag);
  const percent = Math.round((diffCount / 256) * 100);
  if (pct) pct.innerText = `${percent}% (${diffCount}/256 bits)`;
}

export function initComparator() {
  $('comp-a')?.addEventListener('input', runCompare);
  $('comp-b')?.addEventListener('input', runCompare);

  // Run with default values on init
  runCompare();
}

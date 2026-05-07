// ============================================================
// APP.JS — Entry point for CryptoForge Pro
// ============================================================
import { store } from './state.js';
import { initRouter } from './router.js';
import { initTheme } from './theme.js';
import { initCommandPalette } from './command-palette.js';
import { initLibLoader } from './lib-loader.js';
import { $ } from './ui.js';

// Modules
import { initHashStudio } from './modules/hash-studio.js';
import { initKeyGenerator } from './modules/key-generator.js';
import { initKDFEngine } from './modules/kdf-engine.js';
import { initHMACSigner } from './modules/hmac-signer.js';
import { initEncoders } from './modules/encoders.js';
import { initComparator } from './modules/comparator.js';
import { initAESCipher } from './modules/aes-cipher.js';
import { initJWTDecoder } from './modules/jwt-decoder.js';
import { initPasswordAnalyzer } from './modules/password-analyzer.js';
import { initTOTPGenerator } from './modules/totp-generator.js';
import { initHashVerifier } from './modules/hash-verifier.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- Core Infrastructure ---
  initTheme();
  initRouter();
  initCommandPalette();
  initLibLoader();

  // --- Modules ---
  initHashStudio();
  initKeyGenerator();
  initKDFEngine();
  initHMACSigner();
  initEncoders();
  initComparator();
  initAESCipher();
  initJWTDecoder();
  initPasswordAnalyzer();
  initTOTPGenerator();
  initHashVerifier();

  // --- Mobile Nav Toggle ---
  const mobileToggle = $('mobile-nav-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      store.set('sidebarOpen', !store.get('sidebarOpen'));
    });
  }

  const overlay = $('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => store.set('sidebarOpen', false));
  }

  // --- Register Service Worker ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  console.log('%c⚒ CryptoForge Pro v2.0', 'color:#6366f1;font-size:14px;font-weight:bold');
  console.log('%cAll cryptographic operations run locally via WebCrypto API.', 'color:#94a3b8;font-size:11px');
});

<div align="center">

# ⚒ CryptoForge Pro

**Professional Developer Cryptography Toolkit**

SHA-256 · AES-256-GCM · JWT · TOTP · HMAC · Bcrypt · Argon2 · PBKDF2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-indigo?logo=github)](https://harshil8136.github.io/Hash-Generator/)
[![WebCrypto](https://img.shields.io/badge/Powered_By-WebCrypto_API-green?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blueviolet?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero_(Core)-brightgreen)]()
[![Offline](https://img.shields.io/badge/Works-Offline-orange?logo=wifi)]()

*An 11-tool cryptography suite that runs entirely in your browser.  
No server. No tracking. No data ever leaves your device.*

[**🚀 Launch App**](https://harshil8136.github.io/Hash-Generator/) · [Report Bug](https://github.com/Harshil8136/Hash-Generator/issues) · [Request Feature](https://github.com/Harshil8136/Hash-Generator/issues)

</div>

---

## Why CryptoForge Pro?

Most online crypto tools send your data to a server. **CryptoForge Pro doesn't.** Every operation — hashing, encryption, key generation, JWT decoding — runs locally via the **Web Cryptography API**. No npm install. No build step. Open the HTML and start working.

### Key Differentiators

| Feature | CryptoForge Pro | Typical Online Tools |
|---|---|---|
| **Data Transmission** | ❌ Never | ✅ Sent to server |
| **Works Offline** | ✅ Full PWA | ❌ Requires internet |
| **Build Tools Required** | ❌ None | ✅ Often required |
| **External Dependencies** | Optional (CDN opt-in) | Baked in |
| **Open Source** | ✅ MIT | Varies |

---

## 🛠 Tools Included

### Crypto Tools
| # | Tool | Description | Engine |
|---|---|---|---|
| 1 | **Hash Studio** | SHA-256, SHA-512, SHA-3, MD5, RIPEMD-160 | WebCrypto + CryptoJS |
| 2 | **Key Generator** | 256-bit CSPRNG keys (Base64/Hex) + UUID v4 | WebCrypto |
| 3 | **Key Derivation Engine** | Bcrypt, PBKDF2, Argon2id with threat-level presets | Worker + WebCrypto + WASM |
| 4 | **HMAC Signer** | HMAC-SHA256/384/512 message authentication | WebCrypto |
| 5 | **AES-256-GCM Cipher** | Password-based symmetric encrypt/decrypt | WebCrypto (PBKDF2 → AES-GCM) |
| 6 | **JWT Decoder** | Decode & inspect JSON Web Tokens with expiry check | Native JS |

### Utilities
| # | Tool | Description | Engine |
|---|---|---|---|
| 7 | **Encode / Decode** | Base64, URL, Hex, Base32, HTML entity (bidirectional) | Native JS |
| 8 | **Password Analyzer** | Entropy, crack-time estimation (GPU + state actor), pattern detection | Native JS |
| 9 | **TOTP Generator** | RFC 6238 time-based OTP with QR URI export | WebCrypto HMAC-SHA1 |
| 10 | **Hash Verifier** | Constant-time hash comparison for integrity checks | WebCrypto |
| 11 | **Avalanche Analyzer** | Visual 256-bit diff grid showing the avalanche effect | WebCrypto |

---

## 🚀 Quick Start

### Use Online (Recommended)
Visit **[harshil8136.github.io/Hash-Generator](https://harshil8136.github.io/Hash-Generator/)** — works instantly, no install needed.

### Run Locally
```bash
git clone https://github.com/Harshil8136/Hash-Generator.git
cd Hash-Generator
npx serve .
# Open http://localhost:3000
```

> **Note:** ES modules require a web server — `file://` won't work due to CORS.

### Install as PWA
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. CryptoForge Pro is now a desktop app that works offline

---

## 🏗 Architecture

```
Hash-Generator/
├── index.html              # Thin HTML shell (all 11 tool sections)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline cache)
├── favicon.svg             # SVG favicon
├── css/
│   ├── tokens.css          # Design tokens (colors, spacing, typography)
│   ├── base.css            # Reset, typography, utilities
│   ├── layout.css          # Sidebar, main content, responsive grid
│   ├── components.css      # Buttons, cards, inputs, badges, toast
│   └── modules.css         # Tool-specific styles (KDF, TOTP, JWT, etc.)
└── js/
    ├── app.js              # Entry point — imports & initializes everything
    ├── state.js            # Reactive pub/sub store
    ├── router.js           # Hash-based view switching with deep-linking
    ├── ui.js               # Toast, clipboard, debounce, hex/base64 utils
    ├── theme.js            # Dark/light toggle with system detection
    ├── lib-loader.js       # Zero-Trust CDN loader with SRI verification
    ├── command-palette.js  # Ctrl+K fuzzy search across all tools
    ├── history.js          # LocalStorage operation log with CSV/JSON export
    └── modules/
        ├── hash-studio.js
        ├── key-generator.js
        ├── kdf-engine.js
        ├── hmac-signer.js
        ├── aes-cipher.js
        ├── jwt-decoder.js
        ├── encoders.js
        ├── password-analyzer.js
        ├── totp-generator.js
        ├── hash-verifier.js
        └── comparator.js
```

### Design Principles

- **Zero-Build** — No Webpack, Vite, or bundler. Pure ES modules served as static files.
- **Zero-Trust Libraries** — External libs (Bcrypt, CryptoJS, Argon2) load via CDN on demand with SRI integrity checks. Core tools use only native WebCrypto.
- **Reactive State** — Custom pub/sub store (`state.js`) drives UI updates without frameworks.
- **Offline-First** — Service Worker pre-caches the entire app shell for full offline operation.
- **Privacy by Architecture** — No telemetry, no analytics, no server calls. CSP headers enforce this.

---

## 🔒 Security Model

| Layer | What | How |
|---|---|---|
| **Native** | SHA-256, SHA-512, HMAC, PBKDF2, AES-GCM, CSPRNG | Built-in `crypto.subtle` API |
| **CDN Opt-In** | SHA-3, MD5, RIPEMD-160, Bcrypt, Argon2 | External libs with SRI hashes |
| **Web Worker** | Bcrypt hashing | Off-main-thread via inline Blob Worker |
| **CSP** | Content Security Policy | Restricts script/connect/font sources |

External libraries are **disabled by default**. Toggle them via the sidebar "Libs" switch.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` | Open command palette |
| `Ctrl + Enter` | Run current operation |
| `Escape` | Close palette/modal |

---

## 📱 Mobile Support

CryptoForge Pro is fully responsive with:
- Collapsible sidebar drawer (hamburger menu)
- Touch-friendly controls and hit targets
- Mobile-first CSS architecture
- PWA install support on Android/iOS

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — Native browser cryptography
- [bcrypt.js](https://github.com/nicolo-ribaudo/bcryptjs) — Password hashing
- [CryptoJS](https://github.com/brix/crypto-js) — Legacy hash algorithms
- [argon2-browser](https://github.com/nicolo-ribaudo/argon2-browser) — Argon2 WASM implementation
- [Inter](https://rsms.me/inter/) & [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — Typography

---

<div align="center">

**If you find CryptoForge Pro useful, consider giving it a ⭐**

Built with ❤️ by [Harshil Panchal](https://github.com/Harshil8136)

</div>

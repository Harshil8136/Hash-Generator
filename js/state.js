// ============================================================
// STATE — Reactive pub/sub store for CryptoForge Pro
// ============================================================

class Store {
  #state = {};
  #listeners = new Map();

  constructor(initial) {
    this.#state = { ...initial };
  }

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    const old = this.#state[key];
    this.#state[key] = value;
    if (old !== value) this.#notify(key, value, old);
  }

  subscribe(key, fn) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
    this.#listeners.get(key).add(fn);
    // Return unsubscribe function
    return () => this.#listeners.get(key).delete(fn);
  }

  getAll() {
    return { ...this.#state };
  }

  #notify(key, value, old) {
    const fns = this.#listeners.get(key);
    if (fns) fns.forEach(fn => fn(value, old));
  }
}

export const store = new Store({
  libsLoaded: false,
  kdfMode: 'bcrypt',
  currentCost: 10,
  hashMode: 'text',
  activeView: 'hash-studio',
  theme: 'dark',
  sidebarOpen: false
});

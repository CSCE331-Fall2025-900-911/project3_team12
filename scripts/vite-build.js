#!/usr/bin/env node
// Small wrapper to ensure globalThis.crypto.getRandomValues exists
// before invoking Vite's build API. This helps on Node versions
// where the Web Crypto global isn't present.
const nodeCrypto = (() => {
  try { return require('crypto'); } catch (e) { return null; }
})();

if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.getRandomValues !== 'function') {
  if (nodeCrypto && nodeCrypto.webcrypto && typeof nodeCrypto.webcrypto.getRandomValues === 'function') {
    globalThis.crypto = nodeCrypto.webcrypto;
  } else if (nodeCrypto) {
    // Minimal polyfill for getRandomValues using node's randomFillSync
    globalThis.crypto = {
      getRandomValues: (arr) => {
        if (!arr || typeof arr.length !== 'number') throw new TypeError('Expected an array-like with a length property');
        if (!(arr instanceof Uint8Array)) arr = new Uint8Array(arr);
        nodeCrypto.randomFillSync(arr);
        return arr;
      }
    };
  }
}

// Call Vite's build API
(async () => {
  try {
    const { build } = require('vite');
    await build();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

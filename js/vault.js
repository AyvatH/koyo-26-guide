(function() {
  var VAULT_STORAGE_KEY = 'jp2026_vault_pass_v1';

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  async function decryptVault(passphrase) {
    if (!window.ENCRYPTED_VAULT) throw new Error('Şifreli veri bulunamadı');
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Bu tarayıcı WebCrypto şifre çözmeyi desteklemiyor (HTTPS bağlantısı gerekir).');
    }
    var v = window.ENCRYPTED_VAULT;
    var enc = new TextEncoder();
    var keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    var aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: b64ToBytes(v.salt),
        iterations: v.iter || 150000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    var decryptedBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(v.iv) },
      aesKey,
      b64ToBytes(v.cipher)
    );
    var jsonStr = new TextDecoder().decode(decryptedBuf);
    return JSON.parse(jsonStr);
  }

  function applyDecryptedData(data) {
    Object.keys(data).forEach(function(k) {
      window[k] = data[k];
    });
  }

  function finishUnlock() {
    var screen = document.getElementById('vault-lock-screen');
    if (screen) screen.style.display = 'none';
    if (typeof initApp === 'function') initApp();
  }

  async function tryUnlockWith(passphrase, remember) {
    var errEl = document.getElementById('vault-error-msg');
    var btn = document.getElementById('vault-unlock-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Çözülüyor...'; }
    if (errEl) errEl.textContent = '';
    try {
      var data = await decryptVault(passphrase);
      applyDecryptedData(data);
      if (remember && typeof localStorage !== 'undefined') {
        try { localStorage.setItem(VAULT_STORAGE_KEY, passphrase); } catch (e) {}
      }
      finishUnlock();
      return true;
    } catch (e) {
      if (errEl) errEl.textContent = 'Şifre hatalı veya doğrulama başarısız.';
      if (btn) { btn.disabled = false; btn.textContent = 'Kilidi Aç'; }
      return false;
    }
  }

  window.toggleVaultPassVis = function() {
    var inp = document.getElementById('vault-pass-input');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  window.submitVaultUnlock = function(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var inp = document.getElementById('vault-pass-input');
    var rem = document.getElementById('vault-remember-chk');
    var val = inp ? inp.value.trim() : '';
    if (!val) {
      var errEl = document.getElementById('vault-error-msg');
      if (errEl) errEl.textContent = 'Lütfen erişim şifresini girin.';
      return false;
    }
    tryUnlockWith(val, !rem || rem.checked);
    return false;
  };

  window.addEventListener('DOMContentLoaded', async function() {
    var saved = '';
    try {
      if (typeof localStorage !== 'undefined') saved = localStorage.getItem(VAULT_STORAGE_KEY) || '';
    } catch (e) {}
    if (saved) {
      var ok = await tryUnlockWith(saved, false);
      if (ok) return;
    }
    var screen = document.getElementById('vault-lock-screen');
    if (screen) screen.style.display = 'flex';
  });
})();

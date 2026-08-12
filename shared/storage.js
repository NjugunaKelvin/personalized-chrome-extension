/**
 * VIN Chrome Environment - Shared Storage Helper
 * Wraps chrome.storage.sync with fallback to localStorage.
 */

const DEFAULT_SETTINGS = {
  theme: 'auto',              // 'light' | 'dark' | 'auto'
  background: 'arch-1',       // Default photo wallpaper (Concrete Minimalism)
  bgDim: 18,                  // Balanced 18% dim overlay for photo readability
  bgBlur: 0,                  // Backdrop blur 0 - 24px
  customBgData: '',           // Base64 data URL for user uploaded image
  clockFormat: '24',          // '12' | '24'
  showClock: true,
  showSeconds: false,
  showDate: true,
  showQuote: true,
  quoteText: 'Life was meant to be lived.',
  userName: 'Njuguna Kelvin',
  shortName: 'Vin',
  showSignature: true,
  scratchpadText: '',         // Quick notes text
  enableFocusMode: false      // Focus mode active status
};

const STORAGE_KEY = 'vin_chrome_settings';

export const Storage = {
  /**
   * Get default settings object
   */
  getDefaults() {
    return { ...DEFAULT_SETTINGS };
  },

  /**
   * Get settings asynchronously
   */
  async getSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(STORAGE_KEY, (result) => {
          const stored = result && result[STORAGE_KEY] ? result[STORAGE_KEY] : {};
          resolve({ ...DEFAULT_SETTINGS, ...stored });
        });
      } else {
        try {
          const local = localStorage.getItem(STORAGE_KEY);
          const parsed = local ? JSON.parse(local) : {};
          resolve({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (e) {
          resolve({ ...DEFAULT_SETTINGS });
        }
      }
    });
  },

  /**
   * Save partial or full settings
   */
  async saveSettings(newSettings) {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };

    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ [STORAGE_KEY]: updated }, () => {
          resolve(updated);
        });
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage save error', e);
        }
        window.dispatchEvent(new CustomEvent('vin-settings-changed', { detail: updated }));
        resolve(updated);
      }
    });
  },

  /**
   * Listen for settings changes across windows/tabs
   */
  onChanged(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes[STORAGE_KEY]) {
          callback(changes[STORAGE_KEY].newValue);
        }
      });
    } else {
      window.addEventListener('vin-settings-changed', (e) => {
        callback(e.detail);
      });
    }
  }
};

/**
 * VIN Chrome Environment - Shared Storage Helper
 * Wraps chrome.storage.sync (for lightweight settings) and chrome.storage.local
 * (for high-capacity custom image data) with fallback to localStorage.
 */

const DEFAULT_SETTINGS = {
  theme: 'auto',              // 'light' | 'dark' | 'auto'
  background: 'arch-1',       // Default photo wallpaper (Concrete Minimalism)
  bgDim: 22,                  // Optimized 22% dim overlay for perfect text contrast
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

const STORAGE_KEY_SYNC = 'vin_chrome_settings';
const STORAGE_KEY_LOCAL = 'vin_custom_bg';

export const Storage = {
  /**
   * Get default settings object
   */
  getDefaults() {
    return { ...DEFAULT_SETTINGS };
  },

  /**
   * Get settings asynchronously (merges sync settings & local custom image data)
   */
  async getSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(STORAGE_KEY_SYNC, (syncRes) => {
          const syncData = syncRes && syncRes[STORAGE_KEY_SYNC] ? syncRes[STORAGE_KEY_SYNC] : {};
          if (chrome.storage.local) {
            chrome.storage.local.get(STORAGE_KEY_LOCAL, (localRes) => {
              const customBgData = localRes && localRes[STORAGE_KEY_LOCAL] ? localRes[STORAGE_KEY_LOCAL] : '';
              resolve({ ...DEFAULT_SETTINGS, ...syncData, customBgData });
            });
          } else {
            resolve({ ...DEFAULT_SETTINGS, ...syncData });
          }
        });
      } else {
        try {
          const local = localStorage.getItem(STORAGE_KEY_SYNC);
          const parsed = local ? JSON.parse(local) : {};
          const customBgData = localStorage.getItem(STORAGE_KEY_LOCAL) || '';
          resolve({ ...DEFAULT_SETTINGS, ...parsed, customBgData });
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

    // Separate customBgData from sync payload to avoid 8KB quota error!
    const { customBgData, ...syncPayload } = updated;

    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ [STORAGE_KEY_SYNC]: syncPayload }, () => {
          if (typeof newSettings.customBgData !== 'undefined' && chrome.storage.local) {
            chrome.storage.local.set({ [STORAGE_KEY_LOCAL]: newSettings.customBgData }, () => {
              resolve(updated);
            });
          } else {
            resolve(updated);
          }
        });
      } else {
        try {
          localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(syncPayload));
          if (typeof newSettings.customBgData !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_LOCAL, newSettings.customBgData);
          }
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
      chrome.storage.onChanged.addListener(async (changes, areaName) => {
        if (areaName === 'sync' && changes[STORAGE_KEY_SYNC]) {
          const newSync = changes[STORAGE_KEY_SYNC].newValue;
          const current = await this.getSettings();
          callback({ ...current, ...newSync });
        } else if (areaName === 'local' && changes[STORAGE_KEY_LOCAL]) {
          const newCustomBg = changes[STORAGE_KEY_LOCAL].newValue;
          const current = await this.getSettings();
          callback({ ...current, customBgData: newCustomBg });
        }
      });
    } else {
      window.addEventListener('vin-settings-changed', (e) => {
        callback(e.detail);
      });
    }
  }
};

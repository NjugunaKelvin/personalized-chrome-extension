/**
 * VIN Chrome Environment — Extension Popup App Logic
 */

import { Storage } from '../shared/storage.js';

class PopupApp {
  constructor() {
    this.settings = Storage.getDefaults();
    this.initElements();
  }

  initElements() {
    this.themeSegmented = document.getElementById('themeSegmented');
    this.bgSelectGrid = document.getElementById('bgSelectGrid');
    this.popupCustomBgInput = document.getElementById('popupCustomBgInput');
    this.popupDimRange = document.getElementById('popupDimRange');
    this.popupDimVal = document.getElementById('popupDimVal');
    this.popupBlurRange = document.getElementById('popupBlurRange');
    this.popupBlurVal = document.getElementById('popupBlurVal');

    this.toggleClock = document.getElementById('toggleClock');
    this.formatSegmented = document.getElementById('formatSegmented');
    this.toggleSeconds = document.getElementById('toggleSeconds');
    this.toggleDate = document.getElementById('toggleDate');
    this.toggleQuote = document.getElementById('toggleQuote');
    this.quoteInput = document.getElementById('quoteInput');
    this.nameInput = document.getElementById('nameInput');
    this.shortInput = document.getElementById('shortInput');
    this.toggleSignature = document.getElementById('toggleSignature');
  }

  async init() {
    this.settings = await Storage.getSettings();
    this.applyThemeToPopup();
    this.syncInputs();
    this.setupListeners();

    Storage.onChanged((newSettings) => {
      this.settings = newSettings;
      this.applyThemeToPopup();
      this.syncInputs();
    });
  }

  applyThemeToPopup() {
    document.documentElement.setAttribute('data-theme', this.settings.theme || 'auto');
  }

  syncInputs() {
    if (this.themeSegmented) {
      const btns = this.themeSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.theme));
    }

    if (this.bgSelectGrid) {
      const btns = this.bgSelectGrid.querySelectorAll('.bg-pill');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.bg === this.settings.background));
    }

    const dimVal = typeof this.settings.bgDim !== 'undefined' ? this.settings.bgDim : 22;
    const blurVal = typeof this.settings.bgBlur !== 'undefined' ? this.settings.bgBlur : 0;

    if (this.popupDimRange) this.popupDimRange.value = dimVal;
    if (this.popupDimVal) this.popupDimVal.textContent = `${dimVal}%`;

    if (this.popupBlurRange) this.popupBlurRange.value = blurVal;
    if (this.popupBlurVal) this.popupBlurVal.textContent = `${blurVal}px`;

    if (this.toggleClock) this.toggleClock.checked = !!this.settings.showClock;
    if (this.toggleSeconds) this.toggleSeconds.checked = !!this.settings.showSeconds;
    if (this.toggleDate) this.toggleDate.checked = !!this.settings.showDate;
    if (this.toggleQuote) this.toggleQuote.checked = !!this.settings.showQuote;
    if (this.toggleSignature) this.toggleSignature.checked = !!this.settings.showSignature;

    if (this.formatSegmented) {
      const btns = this.formatSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.clockFormat));
    }

    if (this.quoteInput) this.quoteInput.value = this.settings.quoteText || '';
    if (this.nameInput) this.nameInput.value = this.settings.userName || '';
    if (this.shortInput) this.shortInput.value = this.settings.shortName || '';
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    this.applyThemeToPopup();
    await Storage.saveSettings({ [key]: value });
  }

  compressImageFile(file, maxDimension = 1920, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  setupListeners() {
    if (this.themeSegmented) {
      this.themeSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) this.updateSetting('theme', btn.dataset.value);
      });
    }

    if (this.bgSelectGrid) {
      this.bgSelectGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.bg-pill');
        if (btn && btn.dataset.bg) this.updateSetting('background', btn.dataset.bg);
      });
    }

    if (this.popupCustomBgInput) {
      this.popupCustomBgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const compressedDataUrl = await this.compressImageFile(file);
            await this.updateSetting('customBgData', compressedDataUrl);
            await this.updateSetting('background', 'custom');
          } catch (err) {
            console.error('Image compression error', err);
          }
        }
      });
    }

    if (this.popupDimRange) {
      this.popupDimRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.updateSetting('bgDim', val);
      });
    }

    if (this.popupBlurRange) {
      this.popupBlurRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.updateSetting('bgBlur', val);
      });
    }

    if (this.toggleClock) {
      this.toggleClock.addEventListener('change', (e) => this.updateSetting('showClock', e.target.checked));
    }
    if (this.formatSegmented) {
      this.formatSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) this.updateSetting('clockFormat', btn.dataset.value);
      });
    }
    if (this.toggleSeconds) {
      this.toggleSeconds.addEventListener('change', (e) => this.updateSetting('showSeconds', e.target.checked));
    }
    if (this.toggleDate) {
      this.toggleDate.addEventListener('change', (e) => this.updateSetting('showDate', e.target.checked));
    }
    if (this.toggleShowQuote) {
      this.toggleShowQuote.addEventListener('change', (e) => this.updateSetting('showQuote', e.target.checked));
    }
    if (this.quoteInput) {
      this.quoteInput.addEventListener('input', (e) => this.updateSetting('quoteText', e.target.value));
    }
    if (this.nameInput) {
      this.nameInput.addEventListener('input', (e) => this.updateSetting('userName', e.target.value));
    }
    if (this.shortInput) {
      this.shortInput.addEventListener('input', (e) => this.updateSetting('shortName', e.target.value));
    }
    if (this.toggleSignature) {
      this.toggleSignature.addEventListener('change', (e) => this.updateSetting('showSignature', e.target.checked));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PopupApp();
  app.init();
});

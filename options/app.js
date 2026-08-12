/**
 * VIN Chrome Environment — Full Options Page Logic
 */

import { Storage } from '../shared/storage.js';

class OptionsApp {
  constructor() {
    this.settings = Storage.getDefaults();
    this.initElements();
  }

  initElements() {
    this.themeSegmented = document.getElementById('themeSegmented');
    this.bgGrid = document.getElementById('bgGrid');
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
    this.applyTheme();
    this.syncInputs();
    this.setupListeners();

    Storage.onChanged((newSettings) => {
      this.settings = newSettings;
      this.applyTheme();
      this.syncInputs();
    });
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.settings.theme || 'auto');
  }

  syncInputs() {
    if (this.themeSegmented) {
      const btns = this.themeSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.theme));
    }

    if (this.bgGrid) {
      const cards = this.bgGrid.querySelectorAll('.bg-card');
      cards.forEach(card => card.classList.toggle('active', card.dataset.bg === this.settings.background));
    }

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
    this.applyTheme();
    await Storage.saveSettings({ [key]: value });
  }

  setupListeners() {
    if (this.themeSegmented) {
      this.themeSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) this.updateSetting('theme', btn.dataset.value);
      });
    }

    if (this.bgGrid) {
      this.bgGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.bg-card');
        if (card && card.dataset.bg) this.updateSetting('background', card.dataset.bg);
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
    if (this.toggleQuote) {
      this.toggleQuote.addEventListener('change', (e) => this.updateSetting('showQuote', e.target.checked));
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
  const app = new OptionsApp();
  app.init();
});

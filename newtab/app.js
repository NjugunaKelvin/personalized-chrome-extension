/**
 * VIN Chrome Environment — New Tab Page Core Logic
 * Handles real-time clock, contextual greetings, editorial layout, and settings drawer.
 */

import { Storage } from '../shared/storage.js';

class NewTabApp {
  constructor() {
    this.settings = Storage.getDefaults();
    this.clockInterval = null;
    this.initElements();
  }

  initElements() {
    // Editorial Elements
    this.topBrandMark = document.getElementById('topBrandMark');
    this.greetingText = document.getElementById('greetingText');
    this.dateText = document.getElementById('dateText');
    this.clockContainer = document.getElementById('clockContainer');
    this.clockDisplay = document.getElementById('clockDisplay');
    this.clockSeconds = document.getElementById('clockSeconds');
    this.quoteContainer = document.getElementById('quoteContainer');
    this.quoteText = document.getElementById('quoteText');
    this.bottomSignature = document.getElementById('bottomSignature');

    // Settings Drawer Elements
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsDrawer = document.getElementById('settingsDrawer');
    this.drawerOverlay = document.getElementById('drawerOverlay');
    this.drawerCloseBtn = document.getElementById('drawerCloseBtn');

    // Drawer Inputs
    this.themeSegmented = document.getElementById('themeSegmented');
    this.bgOptionsGrid = document.getElementById('bgOptionsGrid');
    this.toggleShowClock = document.getElementById('toggleShowClock');
    this.clockFormatSegmented = document.getElementById('clockFormatSegmented');
    this.toggleShowSeconds = document.getElementById('toggleShowSeconds');
    this.toggleShowDate = document.getElementById('toggleShowDate');
    this.toggleShowQuote = document.getElementById('toggleShowQuote');
    this.quoteTextInput = document.getElementById('quoteTextInput');
    this.presetPills = document.getElementById('presetPills');
    this.userNameInput = document.getElementById('userNameInput');
    this.shortNameInput = document.getElementById('shortNameInput');
    this.toggleShowSignature = document.getElementById('toggleShowSignature');
  }

  async init() {
    // Load initial settings
    this.settings = await Storage.getSettings();
    this.applySettings();
    this.syncDrawerInputs();
    this.startClock();
    this.setupEventListeners();

    // Listen for live changes from popup/options or other tabs
    Storage.onChanged((newSettings) => {
      this.settings = newSettings;
      this.applySettings();
      this.syncDrawerInputs();
    });
  }

  /**
   * Apply settings to DOM elements and document attributes
   */
  applySettings() {
    const {
      theme,
      background,
      showClock,
      clockFormat,
      showSeconds,
      showDate,
      showQuote,
      quoteText,
      userName,
      shortName,
      showSignature
    } = this.settings;

    // 1. Theme Attribute
    document.documentElement.setAttribute('data-theme', theme || 'auto');

    // 2. Background Attribute
    document.body.setAttribute('data-background', background || 'warm-paper');

    // 3. Identity & Greeting
    this.updateGreeting(shortName || 'Vin');
    if (this.topBrandMark) {
      const brandText = this.topBrandMark.querySelector('.brand-text');
      if (brandText) brandText.textContent = (shortName || 'VIN').toUpperCase();
    }

    // 4. Clock Visibility & Options
    if (this.clockContainer) {
      this.clockContainer.style.display = showClock ? 'inline-flex' : 'none';
      if (showSeconds) {
        this.clockContainer.classList.add('show-seconds');
      } else {
        this.clockContainer.classList.remove('show-seconds');
      }
    }
    this.updateClock();

    // 5. Date Visibility
    if (this.dateText) {
      this.dateText.style.display = showDate ? 'block' : 'none';
      this.updateDate();
    }

    // 6. Quote Visibility & Text
    if (this.quoteContainer) {
      this.quoteContainer.style.display = showQuote ? 'block' : 'none';
    }
    if (this.quoteText) {
      this.quoteText.textContent = (quoteText || 'Life was meant to be lived.').toUpperCase();
    }

    // 7. Signature Bar
    if (this.bottomSignature) {
      this.bottomSignature.style.display = showSignature ? 'inline-flex' : 'none';
      const sigName = this.bottomSignature.querySelector('.sig-name');
      if (sigName) sigName.textContent = (shortName || 'VIN').toUpperCase();
    }
  }

  /**
   * Update Contextual Greeting
   */
  updateGreeting(name) {
    if (!this.greetingText) return;
    const hour = new Date().getHours();
    let greeting = 'Good morning';

    if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else if (hour >= 18 || hour < 5) {
      greeting = 'Good evening';
    }

    this.greetingText.textContent = name ? `${greeting}, ${name}.` : `${greeting}.`;
  }

  /**
   * Update Date Display (e.g. WEDNESDAY · AUGUST 12)
   */
  updateDate() {
    if (!this.dateText) return;
    const now = new Date();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateNum = now.getDate();

    this.dateText.textContent = `${dayName} · ${monthName} ${dateNum}`;
  }

  /**
   * Update Digital Clock
   */
  updateClock() {
    if (!this.clockDisplay) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (this.settings.clockFormat === '12') {
      hours = hours % 12 || 12;
    }

    const hoursStr = String(hours).padStart(2, '0');

    this.clockDisplay.textContent = `${hoursStr}:${minutes}`;
    if (this.clockSeconds) {
      this.clockSeconds.textContent = seconds;
    }
  }

  /**
   * Start Ticking Clock Interval
   */
  startClock() {
    this.updateClock();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => {
      this.updateClock();
      // Periodically update date & greeting at midnight/hour change
      if (new Date().getSeconds() === 0) {
        this.updateDate();
        this.updateGreeting(this.settings.shortName || 'Vin');
      }
    }, 1000);
  }

  /**
   * Sync drawer UI controls with current settings
   */
  syncDrawerInputs() {
    // Theme Segmented
    if (this.themeSegmented) {
      const btns = this.themeSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === this.settings.theme);
      });
    }

    // Background Grid
    if (this.bgOptionsGrid) {
      const btns = this.bgOptionsGrid.querySelectorAll('.bg-option-btn');
      btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.bg === this.settings.background);
      });
    }

    // Clock Toggles
    if (this.toggleShowClock) this.toggleShowClock.checked = !!this.settings.showClock;
    if (this.toggleShowSeconds) this.toggleShowSeconds.checked = !!this.settings.showSeconds;
    if (this.toggleShowDate) this.toggleShowDate.checked = !!this.settings.showDate;

    // Clock Format Segmented
    if (this.clockFormatSegmented) {
      const btns = this.clockFormatSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === this.settings.clockFormat);
      });
    }

    // Quote Toggles & Fields
    if (this.toggleShowQuote) this.toggleShowQuote.checked = !!this.settings.showQuote;
    if (this.quoteTextInput) this.quoteTextInput.value = this.settings.quoteText || '';

    // Identity Fields
    if (this.userNameInput) this.userNameInput.value = this.settings.userName || '';
    if (this.shortNameInput) this.shortNameInput.value = this.settings.shortName || '';
    if (this.toggleShowSignature) this.toggleShowSignature.checked = !!this.settings.showSignature;
  }

  /**
   * Save setting update helper
   */
  async updateSetting(key, value) {
    this.settings[key] = value;
    this.applySettings();
    await Storage.saveSettings({ [key]: value });
  }

  /**
   * Event listeners for drawer and controls
   */
  setupEventListeners() {
    // Settings Drawer Open / Close
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
        this.settingsDrawer.classList.add('open');
        this.settingsDrawer.setAttribute('aria-hidden', 'false');
      });
    }

    const closeDrawer = () => {
      this.settingsDrawer.classList.remove('open');
      this.settingsDrawer.setAttribute('aria-hidden', 'true');
    };

    if (this.drawerCloseBtn) this.drawerCloseBtn.addEventListener('click', closeDrawer);
    if (this.drawerOverlay) this.drawerOverlay.addEventListener('click', closeDrawer);

    // Escape key to close drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.settingsDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Theme Segmented Click
    if (this.themeSegmented) {
      this.themeSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) {
          this.updateSetting('theme', btn.dataset.value);
        }
      });
    }

    // Background Grid Click
    if (this.bgOptionsGrid) {
      this.bgOptionsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.bg-option-btn');
        if (btn && btn.dataset.bg) {
          this.updateSetting('background', btn.dataset.bg);
        }
      });
    }

    // Toggles
    if (this.toggleShowClock) {
      this.toggleShowClock.addEventListener('change', (e) => {
        this.updateSetting('showClock', e.target.checked);
      });
    }

    if (this.clockFormatSegmented) {
      this.clockFormatSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) {
          this.updateSetting('clockFormat', btn.dataset.value);
        }
      });
    }

    if (this.toggleShowSeconds) {
      this.toggleShowSeconds.addEventListener('change', (e) => {
        this.updateSetting('showSeconds', e.target.checked);
      });
    }

    if (this.toggleShowDate) {
      this.toggleShowDate.addEventListener('change', (e) => {
        this.updateSetting('showDate', e.target.checked);
      });
    }

    if (this.toggleShowQuote) {
      this.toggleShowQuote.addEventListener('change', (e) => {
        this.updateSetting('showQuote', e.target.checked);
      });
    }

    if (this.quoteTextInput) {
      this.quoteTextInput.addEventListener('input', (e) => {
        this.updateSetting('quoteText', e.target.value);
      });
    }

    // Preset Pills
    if (this.presetPills) {
      this.presetPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.preset-pill');
        if (pill && pill.dataset.quote) {
          if (this.quoteTextInput) this.quoteTextInput.value = pill.dataset.quote;
          this.updateSetting('quoteText', pill.dataset.quote);
        }
      });
    }

    // Identity Inputs
    if (this.userNameInput) {
      this.userNameInput.addEventListener('input', (e) => {
        this.updateSetting('userName', e.target.value);
      });
    }

    if (this.shortNameInput) {
      this.shortNameInput.addEventListener('input', (e) => {
        this.updateSetting('shortName', e.target.value);
      });
    }

    if (this.toggleShowSignature) {
      this.toggleShowSignature.addEventListener('change', (e) => {
        this.updateSetting('showSignature', e.target.checked);
      });
    }
  }
}

// Initialize New Tab App
document.addEventListener('DOMContentLoaded', () => {
  const app = new NewTabApp();
  app.init();
});

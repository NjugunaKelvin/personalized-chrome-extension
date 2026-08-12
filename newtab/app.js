/**
 * VIN Chrome Environment — New Tab Page Core Logic
 * Handles real-time clock, greetings, mouse parallax physics, background image customizer, & spatial transitions.
 */

import { Storage } from '../shared/storage.js';

class NewTabApp {
  constructor() {
    this.settings = Storage.getDefaults();
    this.clockInterval = null;
    this.initElements();
  }

  initElements() {
    // Spatial App Wrapper & Editorial Elements
    this.appWrapper = document.getElementById('appWrapper');
    this.topBrandMark = document.getElementById('topBrandMark');
    this.greetingText = document.getElementById('greetingText');
    this.dateText = document.getElementById('dateText');
    this.clockContainer = document.getElementById('clockContainer');
    this.clockDisplay = document.getElementById('clockDisplay');
    this.clockSeconds = document.getElementById('clockSeconds');
    this.quoteContainer = document.getElementById('quoteContainer');
    this.quoteText = document.getElementById('quoteText');
    this.bottomSignature = document.getElementById('bottomSignature');

    // Action Triggers
    this.settingsBtn = document.getElementById('settingsBtn');
    this.focusModeBtn = document.getElementById('focusModeBtn');
    this.cmdBarBtn = document.getElementById('cmdBarBtn');

    // Command Palette Modal
    this.cmdModal = document.getElementById('cmdModal');
    this.cmdOverlay = document.getElementById('cmdOverlay');
    this.cmdInput = document.getElementById('cmdInput');

    // Settings & Scratchpad Drawer
    this.settingsDrawer = document.getElementById('settingsDrawer');
    this.drawerOverlay = document.getElementById('drawerOverlay');
    this.drawerCloseBtn = document.getElementById('drawerCloseBtn');
    this.tabPreferencesBtn = document.getElementById('tabPreferencesBtn');
    this.tabScratchpadBtn = document.getElementById('tabScratchpadBtn');
    this.panelPreferences = document.getElementById('panelPreferences');
    this.panelScratchpad = document.getElementById('panelScratchpad');

    // Drawer Form Controls
    this.themeSegmented = document.getElementById('themeSegmented');
    this.bgOptionsGrid = document.getElementById('bgOptionsGrid');
    this.customBgInput = document.getElementById('customBgInput');
    this.clearCustomBgBtn = document.getElementById('clearCustomBgBtn');
    this.dimRange = document.getElementById('dimRange');
    this.dimValText = document.getElementById('dimValText');
    this.blurRange = document.getElementById('blurRange');
    this.blurValText = document.getElementById('blurValText');

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

    // Scratchpad
    this.scratchpadArea = document.getElementById('scratchpadArea');
    this.notesSavedBadge = document.getElementById('notesSavedBadge');
  }

  async init() {
    this.settings = await Storage.getSettings();
    this.applySettings();
    this.syncDrawerInputs();
    this.startClock();
    this.setupEventListeners();
    this.setupMouseParallax();

    Storage.onChanged((newSettings) => {
      this.settings = newSettings;
      this.applySettings();
      this.syncDrawerInputs();
    });
  }

  /**
   * Fluid Mouse Parallax Movement
   */
  setupMouseParallax() {
    let ticking = false;
    window.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const mx = (e.clientX / window.innerWidth - 0.5) * 2;
          const my = (e.clientY / window.innerHeight - 0.5) * 2;
          document.body.style.setProperty('--mx', mx.toFixed(3));
          document.body.style.setProperty('--my', my.toFixed(3));
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Apply settings to DOM and CSS custom variables
   */
  applySettings() {
    const {
      theme,
      background,
      bgDim,
      bgBlur,
      customBgData,
      showClock,
      clockFormat,
      showSeconds,
      showDate,
      showQuote,
      quoteText,
      userName,
      shortName,
      showSignature,
      scratchpadText,
      enableFocusMode
    } = this.settings;

    // 1. Theme & Background Mode (Defaults to 'arch-1' photo background if unspecified)
    document.documentElement.setAttribute('data-theme', theme || 'auto');
    document.body.setAttribute('data-background', background || 'arch-1');

    // 2. Custom Background Data URL
    if (customBgData) {
      document.body.style.setProperty('--custom-bg-url', `url("${customBgData}")`);
      if (this.clearCustomBgBtn) this.clearCustomBgBtn.style.display = 'block';
    } else {
      document.body.style.removeProperty('--custom-bg-url');
      if (this.clearCustomBgBtn) this.clearCustomBgBtn.style.display = 'none';
    }

    // 3. Dim Overlay & Blur Sliders
    const dimVal = typeof bgDim !== 'undefined' ? bgDim : 18;
    const blurVal = typeof bgBlur !== 'undefined' ? bgBlur : 0;
    document.body.style.setProperty('--bg-dim-opacity', (dimVal / 100).toString());
    document.body.style.setProperty('--bg-blur-val', `${blurVal}px`);

    if (this.dimValText) this.dimValText.textContent = `${dimVal}%`;
    if (this.blurValText) this.blurValText.textContent = `${blurVal}px`;

    // 4. Focus Mode
    if (enableFocusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }

    // 5. Identity & Greeting
    this.updateGreeting(shortName || 'Vin');
    if (this.topBrandMark) {
      const brandText = this.topBrandMark.querySelector('.brand-text');
      if (brandText) brandText.textContent = (shortName || 'VIN').toUpperCase();
    }

    // 6. Clock & Date
    if (this.clockContainer) {
      this.clockContainer.style.display = showClock ? 'inline-flex' : 'none';
      if (showSeconds) {
        this.clockContainer.classList.add('show-seconds');
      } else {
        this.clockContainer.classList.remove('show-seconds');
      }
    }
    this.updateClock();

    if (this.dateText) {
      this.dateText.style.display = showDate ? 'block' : 'none';
      this.updateDate();
    }

    // 7. Quote & Signature
    if (this.quoteContainer) {
      this.quoteContainer.style.display = showQuote ? 'block' : 'none';
    }
    if (this.quoteText) {
      this.quoteText.textContent = (quoteText || 'Life was meant to be lived.').toUpperCase();
    }

    if (this.bottomSignature) {
      this.bottomSignature.style.display = showSignature ? 'inline-flex' : 'none';
      const sigName = this.bottomSignature.querySelector('.sig-name');
      if (sigName) sigName.textContent = (shortName || 'VIN').toUpperCase();
    }

    // 8. Scratchpad
    if (this.scratchpadArea && document.activeElement !== this.scratchpadArea) {
      this.scratchpadArea.value = scratchpadText || '';
    }
  }

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

  startClock() {
    this.updateClock();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => {
      this.updateClock();
      if (new Date().getSeconds() === 0) {
        this.updateDate();
        this.updateGreeting(this.settings.shortName || 'Vin');
      }
    }, 1000);
  }

  syncDrawerInputs() {
    if (this.themeSegmented) {
      const btns = this.themeSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.theme));
    }

    if (this.bgOptionsGrid) {
      const btns = this.bgOptionsGrid.querySelectorAll('.bg-option-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.bg === this.settings.background));
    }

    if (this.dimRange) this.dimRange.value = typeof this.settings.bgDim !== 'undefined' ? this.settings.bgDim : 18;
    if (this.blurRange) this.blurRange.value = typeof this.settings.bgBlur !== 'undefined' ? this.settings.bgBlur : 0;

    if (this.toggleShowClock) this.toggleShowClock.checked = !!this.settings.showClock;
    if (this.toggleShowSeconds) this.toggleShowSeconds.checked = !!this.settings.showSeconds;
    if (this.toggleShowDate) this.toggleShowDate.checked = !!this.settings.showDate;

    if (this.clockFormatSegmented) {
      const btns = this.clockFormatSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.clockFormat));
    }

    if (this.toggleShowQuote) this.toggleShowQuote.checked = !!this.settings.showQuote;
    if (this.quoteTextInput) this.quoteTextInput.value = this.settings.quoteText || '';
    if (this.userNameInput) this.userNameInput.value = this.settings.userName || '';
    if (this.shortNameInput) this.shortNameInput.value = this.settings.shortName || '';
    if (this.toggleShowSignature) this.toggleShowSignature.checked = !!this.settings.showSignature;
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    this.applySettings();
    await Storage.saveSettings({ [key]: value });
  }

  openDrawer() {
    this.settingsDrawer.classList.add('open');
    this.settingsDrawer.setAttribute('aria-hidden', 'false');
    if (this.appWrapper) this.appWrapper.classList.add('receded');
  }

  closeDrawer() {
    this.settingsDrawer.classList.remove('open');
    this.settingsDrawer.setAttribute('aria-hidden', 'true');
    if (this.appWrapper) this.appWrapper.classList.remove('receded');
  }

  openCommandModal() {
    if (this.cmdModal) {
      this.cmdModal.classList.add('open');
      this.cmdModal.setAttribute('aria-hidden', 'false');
      if (this.cmdInput) {
        this.cmdInput.value = '';
        setTimeout(() => this.cmdInput.focus(), 50);
      }
    }
  }

  closeCommandModal() {
    if (this.cmdModal) {
      this.cmdModal.classList.remove('open');
      this.cmdModal.setAttribute('aria-hidden', 'true');
    }
  }

  setupEventListeners() {
    if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.openDrawer());
    if (this.drawerCloseBtn) this.drawerCloseBtn.addEventListener('click', () => this.closeDrawer());
    if (this.drawerOverlay) this.drawerOverlay.addEventListener('click', () => this.closeDrawer());

    if (this.tabPreferencesBtn && this.tabScratchpadBtn) {
      this.tabPreferencesBtn.addEventListener('click', () => {
        this.tabPreferencesBtn.classList.add('active');
        this.tabScratchpadBtn.classList.remove('active');
        this.panelPreferences.style.display = 'flex';
        this.panelScratchpad.style.display = 'none';
      });

      this.tabScratchpadBtn.addEventListener('click', () => {
        this.tabScratchpadBtn.classList.add('active');
        this.tabPreferencesBtn.classList.remove('active');
        this.panelScratchpad.style.display = 'flex';
        this.panelPreferences.style.display = 'none';
      });
    }

    if (this.cmdBarBtn) this.cmdBarBtn.addEventListener('click', () => this.openCommandModal());
    if (this.cmdOverlay) this.cmdOverlay.addEventListener('click', () => this.closeCommandModal());

    if (this.cmdInput) {
      this.cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = this.cmdInput.value.trim();
          if (query) {
            if (query.startsWith('http://') || query.startsWith('https://')) {
              window.location.href = query;
            } else {
              window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
          }
        }
      });
    }

    if (this.focusModeBtn) {
      this.focusModeBtn.addEventListener('click', () => {
        this.updateSetting('enableFocusMode', !this.settings.enableFocusMode);
      });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.cmdModal.classList.contains('open')) {
          this.closeCommandModal();
        } else {
          this.openCommandModal();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (this.cmdModal && this.cmdModal.classList.contains('open')) {
          this.closeCommandModal();
        } else if (this.settingsDrawer && this.settingsDrawer.classList.contains('open')) {
          this.closeDrawer();
        }
        return;
      }

      if (e.key.toLowerCase() === 'f' && !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        e.preventDefault();
        this.updateSetting('enableFocusMode', !this.settings.enableFocusMode);
      }
    });

    if (this.bgOptionsGrid) {
      this.bgOptionsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.bg-option-btn');
        if (btn && btn.dataset.bg) {
          this.updateSetting('background', btn.dataset.bg);
        }
      });
    }

    if (this.customBgInput) {
      this.customBgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            this.updateSetting('customBgData', dataUrl);
            this.updateSetting('background', 'custom');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (this.clearCustomBgBtn) {
      this.clearCustomBgBtn.addEventListener('click', () => {
        this.updateSetting('customBgData', '');
        this.updateSetting('background', 'arch-1');
      });
    }

    if (this.dimRange) {
      this.dimRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.updateSetting('bgDim', val);
      });
    }

    if (this.blurRange) {
      this.blurRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.updateSetting('bgBlur', val);
      });
    }

    if (this.themeSegmented) {
      this.themeSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) this.updateSetting('theme', btn.dataset.value);
      });
    }

    if (this.toggleShowClock) {
      this.toggleShowClock.addEventListener('change', (e) => this.updateSetting('showClock', e.target.checked));
    }
    if (this.clockFormatSegmented) {
      this.clockFormatSegmented.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (btn && btn.dataset.value) this.updateSetting('clockFormat', btn.dataset.value);
      });
    }
    if (this.toggleShowSeconds) {
      this.toggleShowSeconds.addEventListener('change', (e) => this.updateSetting('showSeconds', e.target.checked));
    }
    if (this.toggleShowDate) {
      this.toggleShowDate.addEventListener('change', (e) => this.updateSetting('showDate', e.target.checked));
    }
    if (this.toggleShowQuote) {
      this.toggleShowQuote.addEventListener('change', (e) => this.updateSetting('showQuote', e.target.checked));
    }
    if (this.quoteTextInput) {
      this.quoteTextInput.addEventListener('input', (e) => this.updateSetting('quoteText', e.target.value));
    }
    if (this.presetPills) {
      this.presetPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.preset-pill');
        if (pill && pill.dataset.quote) {
          if (this.quoteTextInput) this.quoteTextInput.value = pill.dataset.quote;
          this.updateSetting('quoteText', pill.dataset.quote);
        }
      });
    }
    if (this.userNameInput) {
      this.userNameInput.addEventListener('input', (e) => this.updateSetting('userName', e.target.value));
    }
    if (this.shortNameInput) {
      this.shortNameInput.addEventListener('input', (e) => this.updateSetting('shortName', e.target.value));
    }
    if (this.toggleShowSignature) {
      this.toggleShowSignature.addEventListener('change', (e) => this.updateSetting('showSignature', e.target.checked));
    }

    if (this.scratchpadArea) {
      let timeout = null;
      this.scratchpadArea.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.notesSavedBadge) this.notesSavedBadge.classList.remove('show');
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          await this.updateSetting('scratchpadText', val);
          if (this.notesSavedBadge) this.notesSavedBadge.classList.add('show');
        }, 500);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new NewTabApp();
  app.init();
});

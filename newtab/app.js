/**
 * VIN Chrome Environment — New Tab Page Core Logic
 * Handles real-time clock, greetings, mouse parallax physics, soundscape audio, breathing reset, & spatial transitions.
 */

import { Storage } from '../shared/storage.js';
import { SoundEngine } from '../shared/audio.js';

class NewTabApp {
  constructor() {
    this.settings = Storage.getDefaults();
    this.clockInterval = null;
    this.breathTimer = null;
    this.initElements();
  }

  initElements() {
    // Spatial App Wrapper & Editorial Elements
    this.appWrapper = document.getElementById('appWrapper');
    this.greetingText = document.getElementById('greetingText');
    this.dateText = document.getElementById('dateText');
    this.clockContainer = document.getElementById('clockContainer');
    this.clockDisplay = document.getElementById('clockDisplay');
    this.clockSeconds = document.getElementById('clockSeconds');
    this.quoteContainer = document.getElementById('quoteContainer');
    this.quoteText = document.getElementById('quoteText');
    this.bottomSignature = document.getElementById('bottomSignature');
    this.timeZoneText = document.getElementById('timeZoneText');
    this.bgAtmosphereOverlay = document.getElementById('bgAtmosphereOverlay');

    // Soundscape Elements
    this.soundscapePill = document.getElementById('soundscapePill');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundLabelText = document.getElementById('soundLabelText');
    this.soundPopover = document.getElementById('soundPopover');

    // Breathing Reset Modal
    this.breathBtn = document.getElementById('breathBtn');
    this.breathModal = document.getElementById('breathModal');
    this.breathOverlay = document.getElementById('breathOverlay');
    this.breathCloseBtn = document.getElementById('breathCloseBtn');
    this.breathRing = document.getElementById('breathRing');
    this.breathPhaseText = document.getElementById('breathPhaseText');

    // Action Triggers
    this.settingsBtn = document.getElementById('settingsBtn');
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
    this.updateTimeZone();
    this.updateAtmosphereTint();
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
   * Dynamic Time-of-Day Atmosphere Tinting
   */
  updateAtmosphereTint() {
    if (!this.bgAtmosphereOverlay) return;
    const hour = new Date().getHours();
    this.bgAtmosphereOverlay.className = 'bg-atmosphere-overlay active';

    if (hour >= 5 && hour < 12) {
      this.bgAtmosphereOverlay.classList.add('morning');
    } else if (hour >= 17 && hour < 20) {
      this.bgAtmosphereOverlay.classList.add('golden');
    } else if (hour >= 20 || hour < 5) {
      this.bgAtmosphereOverlay.classList.add('indigo');
    }
  }

  /**
   * Dynamic Browser Timezone Detector
   */
  updateTimeZone() {
    if (!this.timeZoneText) return;
    try {
      const rawZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'LOCAL TIME';
      const parts = rawZone.split('/');
      const city = parts[parts.length - 1].replace(/_/g, ' ').toUpperCase();
      this.timeZoneText.textContent = city ? `${city} · LOCAL` : 'LOCAL TIME';
    } catch (e) {
      this.timeZoneText.textContent = 'LOCAL TIME';
    }
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
      shortName,
      showSignature,
      scratchpadText,
      enableFocusMode
    } = this.settings;

    // 1. Theme & Background Mode (Defaults to 'arch-1' photo background if unspecified)
    document.documentElement.setAttribute('data-theme', theme || 'auto');
    document.body.setAttribute('data-background', background || 'arch-1');

    // 2. Custom Background Data URL
    if (background === 'custom' && customBgData) {
      document.body.style.setProperty('--custom-bg-url', `url("${customBgData}")`);
      if (this.clearCustomBgBtn) this.clearCustomBgBtn.style.display = 'block';
    } else {
      document.body.style.removeProperty('--custom-bg-url');
      if (this.clearCustomBgBtn) this.clearCustomBgBtn.style.display = 'none';
    }

    // 3. Dim Overlay & Blur Sliders
    const dimVal = typeof bgDim !== 'undefined' ? bgDim : 22;
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

    // 5. Greeting
    this.updateGreeting(shortName || 'Vin');

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
        this.updateAtmosphereTint();
      }
    }, 1000);
  }

  syncDrawerInputs() {
    if (this.themeSegmented) {
      const btns = this.themeSegmented.querySelectorAll('.segment-btn');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.theme));
    }

    if (this.bgOptionsGrid) {
      const btns = this.bgOptionsGrid.querySelectorAll('.wallpaper-card');
      btns.forEach(btn => btn.classList.toggle('active', btn.dataset.bg === this.settings.background));
    }

    if (this.dimRange) this.dimRange.value = typeof this.settings.bgDim !== 'undefined' ? this.settings.bgDim : 22;
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

  /**
   * HTML5 Canvas Image Downscaling & Compression Helper
   */
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

  /**
   * 60-Second Guided Breath Reset Controller
   */
  startBreathReset() {
    if (!this.breathModal) return;
    this.breathModal.classList.add('open');
    this.breathModal.setAttribute('aria-hidden', 'false');

    let step = 0;
    const runCycle = () => {
      step++;
      if (step === 1) {
        if (this.breathPhaseText) this.breathPhaseText.textContent = 'Inhale deeply...';
        if (this.breathRing) this.breathRing.className = 'breath-ring-outer inhale';
      } else if (step === 2) {
        if (this.breathPhaseText) this.breathPhaseText.textContent = 'Hold breath...';
        if (this.breathRing) this.breathRing.className = 'breath-ring-outer hold';
      } else if (step === 3) {
        if (this.breathPhaseText) this.breathPhaseText.textContent = 'Exhale slowly...';
        if (this.breathRing) this.breathRing.className = 'breath-ring-outer exhale';
      } else if (step >= 4) {
        step = 0;
      }
    };

    runCycle();
    if (this.breathTimer) clearInterval(this.breathTimer);
    this.breathTimer = setInterval(runCycle, 4000);
  }

  stopBreathReset() {
    if (this.breathTimer) clearInterval(this.breathTimer);
    if (this.breathModal) {
      this.breathModal.classList.remove('open');
      this.breathModal.setAttribute('aria-hidden', 'true');
    }
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
    // Soundscape Controls
    if (this.soundToggleBtn && this.soundscapePill) {
      this.soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.soundscapePill.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!this.soundscapePill.contains(e.target)) {
          this.soundscapePill.classList.remove('open');
        }
      });
    }

    if (this.soundPopover) {
      this.soundPopover.addEventListener('click', (e) => {
        const btn = e.target.closest('.sound-opt-btn');
        if (btn && btn.dataset.sound) {
          const sound = btn.dataset.sound;
          const btns = this.soundPopover.querySelectorAll('.sound-opt-btn');
          btns.forEach(b => b.classList.toggle('active', b.dataset.sound === sound));

          if (sound === 'none') {
            SoundEngine.stop();
            if (this.soundLabelText) this.soundLabelText.textContent = 'SOUNDSCAPE';
          } else {
            SoundEngine.playPreset(sound);
            const labelMap = {
              'brown-noise': 'BROWN NOISE',
              'soft-rain': 'SOFT RAIN',
              'warm-drone': '432HZ DRONE'
            };
            if (this.soundLabelText) this.soundLabelText.textContent = labelMap[sound] || 'SOUNDSCAPE';
          }
          this.soundscapePill.classList.remove('open');
        }
      });
    }

    // Breath Reset
    if (this.breathBtn) this.breathBtn.addEventListener('click', () => this.startBreathReset());
    if (this.breathCloseBtn) this.breathCloseBtn.addEventListener('click', () => this.stopBreathReset());
    if (this.breathOverlay) this.breathOverlay.addEventListener('click', () => this.stopBreathReset());

    // Drawer
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
        if (this.breathModal && this.breathModal.classList.contains('open')) {
          this.stopBreathReset();
        } else if (this.cmdModal && this.cmdModal.classList.contains('open')) {
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
        const btn = e.target.closest('.wallpaper-card');
        if (btn && btn.dataset.bg) {
          this.updateSetting('background', btn.dataset.bg);
        }
      });
    }

    if (this.customBgInput) {
      this.customBgInput.addEventListener('change', async (e) => {
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

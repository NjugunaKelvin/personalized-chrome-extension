# VIN - Personal Chrome Environment & Theme

<p align="center">
  <img src="assets/icons/icon128.png" width="96" alt="VIN Environment Logo" />
</p>

<p align="center">
  <strong>A clean, calm, and human-centric browser environment engineered for focus, elegance, and spatial simplicity.</strong>
</p>

<p align="center">
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Manifest-V3-6366F1?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="MIT License" /></a>
  <a href="https://github.com/NjugunaKelvin/personalized-chrome-extension"><img src="https://img.shields.io/badge/Version-1.5.0-F59E0B?style=for-the-badge" alt="Version 1.5.0" /></a>
  <a href="https://github.com/NjugunaKelvin/personalized-chrome-extension/stargazers"><img src="https://img.shields.io/badge/PRs-Welcome-3B82F6?style=for-the-badge" alt="PRs Welcome" /></a>
</p>

---

## Personal Vision Statement

> *"I created this extension to transform my daily web browser experience from a noisy, cluttered tab interface into a calm, intentional, and human-centric digital sanctuary."*  
> — **Njuguna Kelvin (Vin)** Creator & Lead Designer

Modern web browsers are often filled with visual noise, aggressive ads, and distracting widgets. **VIN** was built on the belief that software should feel like a serene architectural space,  quiet, restrained, continuous, and focused.

Whether you are writing code, designing interfaces, or conducting deep research, **VIN** gives you back your focus every time you press `Cmd+T`.

---

## Features Overview

### 1. Minimalist Editorial Central Core
- **Contextual Greetings**: Dynamic greetings (`Good morning, Vin.`, `Good afternoon, Vin.`, `Good evening, Vin.`).
- **High-Impact Typography**: Clean time display, date headers, and custom philosophy statement (`LIFE WAS MEANT TO BE LIVED.`).
- **High-Contrast Visibility**: Text drop shadows (`text-shadow: 0 2px 14px rgba(0,0,0,0.28)`) ensure crisp readability over any background photograph.

### 2. Vertical Floating Right Edge Icon Dock
- Replaces generic navigation text with a **vertical glass dock** pinned to the right edge (`position: fixed; right: 22px; top: 50%`):
  - SVG brand icons for **GitHub**, **Linear**, **Figma**, **Notion**, and **X**.
  - Smooth micro-hover scaling (`scale(1.15)`) with left-sliding glass tooltip labels.

### 3. Curated Architecture Wallpapers & High-Capacity Uploader
- **Curated Gallery**: Concrete Minimalism (`arch-1.png`), Misty City (`city-1.png`), Shadows (`arch-2.png`), and Courtyard (`arch-3.png`).
- **High-Capacity Custom Upload**: Canvas downscaling pipeline (max 1920px width & 85% JPEG compression) saves custom wallpapers to `chrome.storage.local` without throwing Chrome quota errors.
- **Dim & Blur Sliders**: Precise control over background dimming (0–80%) and backdrop blur (0–24px).

### 4. Web Audio Procedural Focus Soundscapes
- Built-in sound engine requiring **zero external MP3 downloads**:
  - **Deep Brown Noise**: Warm low-pass acoustic noise.
  - **Soft Rain**: Pink noise synthesis with droplet filtering.
  - **Warm 432Hz Drone**: Harmonic sine oscillators for meditative focus.

### 5. Micro-Mindfulness "1-Min Reset" Breathing Ring
- A 60-second guided breathing ring modal (`Inhale 4s` → `Hold 4s` → `Exhale 4s`) with smooth expanding glowing keyframes.

### 6. Dynamic Time-of-Day Atmosphere Tinting
- Ambient gradient overlay that adjusts lighting automatically based on your local hour (*Morning Mist*, *Golden Hour Amber*, *Midnight Indigo*).

### 7. Floating Command Palette (`Cmd+K` / `Ctrl+K`) & Spatial Scratchpad
- Omnibox modal for web searches and URL jumps.
- Auto-saving quick notes drawer.

---

## Customization & Extensibility

**VIN** is built to be easily customizable for anyone:

### 1. Customizing Color Tokens & Radii
All design tokens are defined in [`shared/theme.css`](file:///c:/Users/Vin/Desktop/projects/chrome-extension/shared/theme.css):
```css
:root {
  /* Continuous Curvature Radii */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;

  /* Spring Physics Motion Curve */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 2. Adding New Wallpaper Photo Presets
1. Drop your PNG/JPEG image into `assets/backgrounds/`.
2. Add a CSS background rule in [`assets/backgrounds/background-patterns.css`](file:///c:/Users/Vin/Desktop/projects/chrome-extension/assets/backgrounds/background-patterns.css).
3. Add a thumbnail card button to [`newtab/index.html`](file:///c:/Users/Vin/Desktop/projects/chrome-extension/newtab/index.html).

---

## Project Architecture

```
chrome-extension/
├── manifest.json                  # Manifest V3 Extension & Theme configuration
├── README.md                      # Open-source documentation & vision statement
├── walkthrough.md                 # Visual feature walkthrough with screenshots
│
├── shared/
│   ├── theme.css                  # Design tokens, squircle radii, & theme variables
│   ├── storage.js                 # Chrome sync & local storage manager
│   └── audio.js                   # Web Audio API procedural soundscape engine
│
├── newtab/
│   ├── index.html                 # Main editorial page & vertical icon dock markup
│   ├── styles.css                 # Typography hierarchy, glass capsules, & dock styles
│   └── app.js                     # Core app logic (clock, greetings, sound, breath reset)
│
├── popup/
│   ├── index.html                 # Toolbar dropdown popup
│   ├── styles.css                 # Popup styles
│   └── app.js                     # Toolbar popup logic
│
├── options/
│   ├── index.html                 # Full Chrome Options page
│   ├── styles.css                 # Options page design system
│   └── app.js                     # Options page storage controller
│
└── assets/
    ├── backgrounds/               # High-res architecture photo wallpapers
    └── icons/                     # Extension icons (16x16, 48x48, 128x128)
```

---

## Contributing Guidelines

We welcome community contributions from developers, product designers, and web enthusiasts who share a passion for calm software!

### How to Contribute:
1. **Fork the Repository**: Click the **Fork** button on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
3. **Make Your Changes**: Ensure your code adheres to zero-dependency Vanilla JS/CSS standards.
4. **Test Locally**: Load unpacked extension in `chrome://extensions` and verify syntax:
   ```bash
   node --check shared/storage.js shared/audio.js newtab/app.js popup/app.js options/app.js
   ```
5. **Submit a Pull Request**: Describe your additions clearly in the PR template.

---

## License & Credits

Crafted, engineered, and maintained by **Njuguna Kelvin (Vin)** and the open-source community.  
Distributed under the **MIT License**.

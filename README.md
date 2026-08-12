# VIN — Personal Chrome Environment

A hyper-detailed, calm, editorial, and personalized Chrome extension and browser theme crafted specifically for **Njuguna Kelvin (Vin)**.

Inspired by Apple product design, macOS minimalism, Linear, Arc Browser, and Japanese spatial minimalism, **VIN** transforms your Chrome browser into a quiet digital sanctuary.

---

## Features

- **Personalized Editorial New Tab Page**:
  - Contextual dynamic greetings (`Good morning, Vin.`, `Good afternoon, Vin.`, `Good evening, Vin.`).
  - Formatted date display (`WEDNESDAY · AUGUST 12`).
  - Minimal digital clock with 12h/24h formats, toggleable seconds, and date controls.
  - Understated philosophy quote (`LIFE WAS MEANT TO BE LIVED.`) with preset selectors and editable custom text.
  - Designer signature mark (`VIN`).

- **Color Token System & Theme Modes**:
  - **Warm Light Mode**: Soft off-white canvas (`#F7F6F2`) with warm slate typography (`#171717`).
  - **Soft Graphite Dark Mode**: Deep midnight charcoal (`#0D0D0D` / `#151515`).
  - **System Auto Mode**: Follows your operating system schedule.

- **Abstract Wallpaper Backgrounds**:
  1. `Warm Paper` — Gentle subtle off-white grain texture.
  2. `Quiet Stone` — Micro-stipple stone dot pattern.
  3. `Soft Graphite` — Soft dark mesh texture.
  4. `Architectural` — Abstract geometric grid lines.
  5. `Pure Blank` — Pristine untextured monochrome canvas.

- **Dual Customization Hubs**:
  - **Extension Popup**: Compact native iPhone-style settings card accessible directly from your toolbar.
  - **Embedded Settings Drawer**: Slide-in settings panel on the New Tab page.
  - **Full Options Page**: Dedicated browser settings window.

- **Zero External Dependencies**: Built with vanilla HTML5, modern CSS custom properties, ES modules, and standard Chrome extension APIs.

---

## Project Structure

```text
vin-chrome-theme/
├── manifest.json                  # Manifest V3 theme & extension configuration
├── shared/
│   ├── theme.css                  # Design system CSS variables, color tokens, & fonts
│   └── storage.js                 # Chrome sync storage helper with localStorage fallback
├── newtab/
│   ├── index.html                 # Editorial New Tab HTML structure
│   ├── styles.css                 # Spatial layout, typography tracking, & drawer styles
│   └── app.js                     # Dynamic clock, greeting, & reactive storage controller
├── popup/
│   ├── index.html                 # Toolbar extension popup UI
│   ├── styles.css                 # Tactile iPhone control styles
│   └── app.js                     # Popup settings logic
├── options/
│   ├── index.html                 # Dedicated full options page
│   ├── styles.css                 # Options page layout
│   └── app.js                     # Options page controller
├── assets/
│   ├── backgrounds/
│   │   └── background-patterns.css# Self-contained procedural SVG wallpaper textures
│   └── icons/
│       ├── icon16.png             # Toolbar 16x16 icon
│       ├── icon48.png             # Extension manager 48x48 icon
│       ├── icon128.png            # Chrome Web Store / App list 128x128 icon
│       └── generate_icons.js      # Zero-dependency Node.js PNG icon compiler
└── README.md                      # Comprehensive guide and documentation
```

---

## Installation Instructions

1. Open **Google Chrome** (or any Chromium browser such as Brave, Edge, Arc).
2. Navigate to `chrome://extensions/` in your address bar.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left.
5. Select the directory: `c:\Users\Vin\Desktop\projects\chrome-extension`.
6. Open a new tab to experience your new personalized environment!

---

## How to Customize

### 1. Customizing Colors & Design Tokens
Open `shared/theme.css`. Modify the CSS custom properties under `:root` (Light mode) or `[data-theme="dark"]` (Dark mode):

```css
:root {
  --bg: #F7F6F2;              /* Main background color */
  --surface: #EFEEE9;         /* Card & UI surface color */
  --text-primary: #171717;    /* Primary text color */
  --text-secondary: #6F6D68;  /* Subtitle text color */
  --border: #E5E2DB;          /* Separator & border color */
}
```

### 2. Changing the Personal Quote
You can change the quote instantly:
- Click the **VIN** icon in your Chrome toolbar (or click the settings gear icon in the top right of your New Tab page).
- Type any phrase into the **Custom Quote** / **Personal Phrase** text field.
- Alternatively, edit `DEFAULT_SETTINGS` in `shared/storage.js`.

### 3. Adding Additional Background Patterns
1. Open `assets/backgrounds/background-patterns.css`.
2. Add a new selector and SVG data URI:

```css
[data-background="my-custom-pattern"] .bg-layer {
  background-image: url("data:image/svg+xml,...");
  opacity: 0.05;
}
```

3. Add `"my-custom-pattern"` to your settings UI in `newtab/index.html` or `popup/index.html`.

---

## Packaging the Extension for Distribution

To create a `.zip` file to share or install on another machine:

1. Open PowerShell or Command Prompt in the project folder.
2. Run the following command (on Windows PowerShell):
   ```powershell
   Compress-Archive -Path manifest.json, shared, newtab, popup, options, assets, README.md -DestinationPath VIN-Chrome-Environment.zip -Force
   ```
3. Or go to `chrome://extensions/`, click **Pack extension**, and choose the project directory.

---

## Known Chrome API Capabilities & Limitations

1. **Native Chrome Window Frame vs. New Tab Page**:
   - The browser window frame, tab bar, and omnibox colors are configured statically via the `theme` field in `manifest.json`.
   - Dynamic JavaScript theme switches (Light/Dark/Auto) apply instantly to the **New Tab Page**, **Extension Popup**, and **Options Page**.

2. **Cross-Tab Synchronization**:
   - Preferences saved in the extension popup automatically sync across all open New Tab windows instantly via `chrome.storage.sync`.

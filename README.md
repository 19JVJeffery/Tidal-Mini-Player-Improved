# Tidal Mini Player (Improved)

A feature-rich mini player plugin for [TidaLuna](https://github.com/Inrixia/TidaLuna) – the Tidal client mod.

---

## Features

| Feature | Detail |
|---|---|
| 🖼 Album artwork | Fills the entire player surface; supports **animated / video covers** |
| 🎛 Playback controls | Previous · Play/Pause · Next revealed **on hover** |
| 🔊 Volume scroll | Mouse wheel / trackpad **vertical scroll** changes volume; animated feedback bar |
| ↔ Skip via swipe | Trackpad **horizontal scroll** skips forward or back |
| ❤️ Like button | One-click heart to **add/remove the current track** from your favourites |
| 🏷 Quality pill | Shows audio quality badge (HiRes, LOSSLESS, etc.) – toggle in settings |
| 📝 Lyrics | Synced lyric line display (toggle in settings) |
| ⚙️ Settings | Right-click the player for the settings menu |
| 🖱 Draggable | Drag to any corner; position persists across sessions |

---

## Installation

### Via TidaLuna Plugin Store (recommended)

1. Open Tidal with TidaLuna installed.
2. Right-click your profile picture → **Luna Settings** → **Plugin Store**.
3. Paste the plugin URL:
   ```
   https://raw.githubusercontent.com/19JVJeffery/Tidal-Mini-Player-Improved/main/dist/tidal-mini-player
   ```
4. Click **Install**.

### Manual install

Download `dist/tidal-mini-player.mjs` and `dist/tidal-mini-player.json` from this repository and place them in your TidaLuna plugins folder.

---

## Usage

- The mini player appears in the **bottom-right corner** of your screen when the plugin loads.
- **Hover** over the player to reveal playback controls.
- **Scroll up/down** to change the volume (or seek, configurable).
- **Horizontal trackpad swipe** skips the track.
- **Right-click** the player to open the settings menu.
- **Close** via the ✕ button; re-open by right-clicking your Tidal profile picture → **Mini Player**.

---

## Building from source

```bash
# Install dependencies
npm install

# Build (outputs dist/)
npm run build

# Watch mode for development
npm run watch
```

Requires Node 20+ and the TidaLuna workspace to resolve `@luna/*` types.

# Florida After Dark
> A procedural terminal adventure about driving through Florida at 2:00 AM when you probably should have gone home.

**Florida After Dark** is a small browser text-adventure inspired by old terminal games, late-night Florida road trips, AM/FM radio weirdness, wildlife, roadside folklore, and the poor decisions that become interesting after midnight.

No installation, framework, account, API, or build step is required.

## Play Online

**GitHub Pages:** https://mathguy-uf.github.io/fl_after_dark/

> 📷 **Screenshot placeholder:** add `assets/screenshot.png` here later if you want a preview image in the README.

## Controls

Everything is button-driven, so the game works well with a mouse, keyboard, or phone touchscreen.

- **Explore Area** — look for encounters at the current location.
- **Drive to...** — travel along one of the connected roads.
- **Radio** — tune through eight late-night stations.
- **View Map** — see discovered locations and route connections.
- **Inventory** — check the handful of items you have collected.
- **Save / Load** — store one night in your browser with `localStorage`.
- **New Night** — generate a new night seed and restart.
- **Settings** — switch between Green CRT, Amber CRT, and Game Boy-style grayscale; animations can also be disabled.

## Features

- 14 Florida-inspired locations, including hidden **Station 17**.
- 30 ordinary and strange encounters.
- Florida wildlife: alligators, armadillos, raccoons, deer, manatees, pelicans, ibis, and anhingas.
- Coastal fishing references including snook, tarpon, redfish, and grouper.
- Eight text-only radio frequencies with several unusual signals.
- A simple discovery map and tiny inventory system.
- Light fuel/time management without survival-game bookkeeping.
- Three endings: uncover the Florida Man loop, go home, or run out of fuel.
- Seeded pseudo-random encounter selection.
- Local browser saving.
- Responsive mobile layout.
- Keyboard-accessible controls and reduced-motion support.
- No image assets required.

## Run Locally

The game is entirely static. You can simply open `index.html` in a modern browser.

```text
fl_after_dark/
├── index.html
├── style.css
├── game.js
├── map.js
├── scenes.js
├── humor.js
├── story.js
├── story-scenes.js
├── consequences.js
├── README.md
└── assets/
```

For browsers that are unusually strict about local files, any basic static web server also works, but one is not required by the project.

## Deploy with GitHub Pages

1. Push the files to the repository's default branch (`main`).
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose `main` and `/ (root)`.
6. Save.

Because `index.html` is in the repository root, the game becomes the Pages front page automatically.

## Modifying the Game

Most editable content is near the top of `game.js`:

- `locations` — descriptions, connections, and risk levels.
- `events` — encounter text, choices, item rewards, and endings.
- `radioStations` — frequencies and radio flavor text.
- `ITEM_LABELS` — the small inventory list.

The main game functions are intentionally straightforward: `travelTo()`, `triggerEvent()`, `showChoices()`, `advanceTime()`, `updateHUD()`, `openRadio()`, `openMap()`, `saveGame()`, and `loadGame()`.

## Project Structure

```text
fl_after_dark/
├── index.html      # Page structure and overlays
├── style.css       # CRT themes, responsive layout, accessibility styles
├── game.js         # World data, encounters, radio, state, save/load, endings
├── map.js          # Pixel map and accessible routes
├── scenes.js       # Procedural illustrations
├── humor.js        # Occasional roadside asides
├── story.js        # Three-act mystery
├── story-scenes.js # Story illustrations
├── consequences.js # Remembered decisions and scene restoration
├── README.md       # This file
└── assets/         # Reserved for optional screenshots or future local assets
```

## License

Released under the MIT License; see LICENSE.

The game text and visual design are original to this project and use no external runtime dependencies.


## Story and release notes
Seven one-time decisions are remembered across saves: roadside help, the phone, the coin, the cassette, warning a family, the motel register, and emergency fuel. Later scenes change supplies, delays, evidence, and the final archive. Giving away the coin preserves its coordinates.

Runtime scripts load in order: game.js, map.js, scenes.js, humor.js, story.js, story-scenes.js, consequences.js. Include all seven when copying or deploying. The map includes a readable route list. Narrative appears immediately for reliable assistive reading; motion settings control decorative effects. Saves restore the current story scene. Mobile Safari and VoiceOver still need device testing.

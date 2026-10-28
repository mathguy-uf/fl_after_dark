# Florida After Dark
> A procedural terminal adventure about driving through Florida at 2:00 AM when you probably should have gone home.

**Florida After Dark** is a small browser text-adventure inspired by old terminal games, late-night Florida road trips, AM/FM radio weirdness, wildlife, roadside folklore, and the poor decisions that become interesting after midnight.

No installation, framework, account, API, or build step is required.

## Play Online

**GitHub Pages:** https://mathguy-uf.github.io/fl_after_dark/

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

- A three-act Station 17 mystery whose archive reflects choices made during the current night.
- 14 Florida-inspired locations, including hidden **Station 17**.
- 30 ordinary and strange encounters.
- Seven remembered decision moments with later consequences.
- Florida wildlife: alligators, armadillos, raccoons, deer, manatees, pelicans, ibis, and anhingas.
- Coastal fishing references including snook, tarpon, redfish, and grouper.
- Eight text-only radio frequencies with several unusual signals.
- Illustrated green-screen scene art with recognizable Florida landmarks, plus a 640×520 illustrated discovery map.
- Light fuel/time management without survival-game bookkeeping.
- Four decision-dependent Station 17 endings, plus going home and running out of fuel.
- Seeded pseudo-random encounter selection.
- Local browser saving, including the current story scene.
- Responsive mobile layout.
- Keyboard-accessible controls and reduced-motion support.
- Local artwork included; no external runtime dependencies required.

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
├── endings.js
├── illustrations.js
├── runtime.js
├── README.md
├── tests/
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

Story content lives primarily in `story.js` and remembered one-time decisions live in `consequences.js`.

**Important:** `runtime.js` is loaded last and is the canonical integration layer for travel, location actions, event resolution, save-scene restoration, and scene-art selection. New systems should extend its runtime hooks or explicit art maps instead of wrapping those global functions again. This keeps behavior independent of incidental script-wrapper order.

## Project Structure

```text
fl_after_dark/
├── index.html      # Page structure, overlays, and script load order
├── style.css       # CRT themes, responsive layout, accessibility styles
├── game.js         # World data, encounters, radio, state, save/load, core helpers
├── map.js          # 640×520 illustrated map and accessible route list
├── scenes.js       # Scene dimensions, palette and scheduling; legacy drawing helpers
├── humor.js        # Occasional roadside asides; no separate Florida Man NPC
├── story.js        # Three-act mystery and Station 17 reveal
├── story-scenes.js # Story-specific drawing functions
├── consequences.js # Remembered decisions and consequence data
├── endings.js      # Branching conclusions and night report
├── illustrations.js # Approved artwork atlas, source rectangles and image loading
├── runtime.js      # Canonical gameplay integration and explicit art routing
├── tests/          # Dependency-free regression harness
├── README.md       # This file
└── assets/art/     # Included green-screen artwork (two lossless WebP atlases)
```

## License

Released under the MIT License; see LICENSE.

The game text and visual design are original to this project and use no external runtime dependencies.

## Story and release notes

Seven one-time decisions are remembered across saves: roadside help, the phone, the coin, the cassette, warning a family, the motel register, and emergency fuel. Later scenes change supplies, delays, evidence, and the final archive. Giving away the coin preserves its coordinates.

The letter supplies concrete leads to the pier, motel, and citrus stand. A missing minute gives the driver a reason to investigate; witness accounts and broadcasts gradually turn roadside absurdity into a personal mystery. Story dialogue and consequence scenes suppress optional humor asides. Witness references, radio locations, and rescue dialogue follow the player's actual route and decisions.

The three-act pacing is deliberate: collecting the three route items can mark Station 17 internally for clue bookkeeping, but it remains unavailable to the player until the Space Coast archive report, Everglades radio echo, and **YOU KNOW THE WAY** route reveal have occurred. Both the map and travel controls enforce that story gate. The rare same-car doppelgänger scene is restricted to the middle act so it cannot expose the central idea on the first road out of Gainesville.

Illustrations are selected from explicit scene, event, decision, and story-function IDs. Narrative text no longer decides which picture is drawn, so a postcard mentioning Station 17 or dialogue mentioning an alligator cannot accidentally replace the actual current-location artwork.

Runtime scripts load in order: `game.js`, `map.js`, `scenes.js`, `humor.js`, `story.js`, `story-scenes.js`, `consequences.js`, `endings.js`, `illustrations.js`, then **`runtime.js` last**. The map includes a readable route list. Narrative appears immediately for reliable assistive reading; motion settings control decorative effects. Saves restore the current story scene. Mobile Safari and VoiceOver still need device testing.

## Night complete

After each ending, choose **End Night** to see a compact terminal report: miles driven, locations found out of 14, strange events, Florida Man echoes, and the ending name. **Drive Again** starts a fresh seeded night immediately. There are no scores, badges, or unlock requirements.

Locations found counts places actually visited, not nearby roads marked on the map. Strange events counts distinct strange encounters and story scenes; repeating or reloading the same encounter does not inflate it. Florida Man echoes count the pier reflection and security-monitor sighting, not references in dialogue. Reports retain their ending and counts when saved and restored. Older saves without counters begin recording encounters from this update onward; their historical miles and visited places remain intact.

<details>
<summary>Ending logic — spoilers</summary>

The Station 17 identity reveal always happens first. The first matching route below determines the conclusion, with no random ending roll:

1. **Morning Traffic:** cross out your name, warn the family, and either help the stranded driver or leave the emergency reserve. People you protected interrupt the loop.
2. **Dead Air:** cross out your name, answer the phone, and play the cassette. You recognize the relay's timing and interrupt the transmission.
3. **Borrowed Time:** give away the coin. Your other self buys your escape, but remains behind.
4. **The Other Driver:** otherwise, the loop completes.

Going home (**Home Before Sunrise**) or exhausting fuel (**Empty**) ends the night early. Missing decisions do not count as selecting either option.

The escape routes are foreshadowed in dialogue: June remembers the driver who helped her; leaving emergency fuel makes another rescue vehicle available; the family promises to contact road service. The phone and cassette establish the relay's interruptible gap. The register explicitly authorizes a return, and the pier figure explains what the coin buys. At the finale, the received letter and the fresh copy remain separate objects. The driver writes to give their forgetful earlier self a route to the relay, completing the setup of the torn envelope, different ink, and crescent of mud.
</details>

## Regression checks

Run `node tests/endings.test.cjs`. The dependency-free JavaScript/DOM-stub harness loads the same ten scripts as the page and verifies that `runtime.js` owns the canonical high-risk entry points. It checks all 128 decision combinations, all four finale paths, both early endings, save/load restoration, all 14 decision branches, report counts, encounter deduplication, replay resets, Act III story ordering, the **WHO IS SUBJECT?** route-reveal path, hidden Station 17 travel gating, explicit scene-art routing, the middle-act doppelgänger gate, and a connected Gainesville-to-Station-17 journey. It is not a substitute for browser rendering, Mobile Safari, or VoiceOver testing.

Story continuity checks also cover an unopened-letter home ending, reaching the Space Coast before the pier, radio updates during backtracking, both rescue variants and their saved text, missing versus chosen register decisions, and humor suppression during consequential dialogue.



## Illustrated scenes

All 14 locations and the letter, archive, monitor, bucket, road, loop, and reveal use the approved green-on-black illustrated style. Dedicated payphone, cassette, family, and alligator views support their encounters. The title screen features UF Century Tower. Regional details include the Paynes Prairie observation tower, Suwannee railroad trestle, Cedar Key waterfront, Vehicle Assembly Building, Shark Valley-inspired tower, Bridge of Lions, Juniper Springs sign, and Fred the Tree on the old Seven Mile Bridge. These are stylized regional illustrations, not exact street views.

The 24 panels are stored in two local lossless WebP atlases. `illustrations.js` draws only the scene rectangles, excluding preview labels and borders. The scene canvas is 504×216 with nearest-neighbor display; the interactive map remains a separate 640×520 canvas driven by discovered routes. Amber and grayscale themes recolor the illustrations through CSS without reading canvas pixels, preserving support for opening `index.html` directly. Keep `assets/art/` alongside the scripts when downloading the game.

Images are cached after loading. A completed download redraws the current scene, so rapid travel or loading a save cannot display an earlier scene. Loading or unavailable-art messages leave the text adventure playable. Illustration captions for assistive technology describe the current artwork.

Artwork was created with AI image generation from the approved original art direction, then encoded as lossless WebP with decoded RGB pixels verified identical to the source PNGs. No third-party game sprites are included. The full artwork transfer is approximately 4.8 MB, cached for the session.

Run `node tests/illustrations.test.cjs` for asset coverage, crop bounds, image-cache behavior, late-loading images, failure handling, and script-order checks. The story suite additionally verifies illustration routing through saves and decisions. The atlas crops have also been rendered and visually inspected with a real canvas implementation. Full browser/device testing remains recommended.

## Illustrated road map

The map uses a filled, dithered Florida silhouette with coastal detail, forest and wetland textures, Lake Okeechobee, a compass rose and southwest-trending Keys. Its numbered callouts match a readable location key, avoiding tiny overlapping place names on phones. A current-location artwork card links the map visually to the illustrated scenes. The opaque map window prevents underlying dialogue from showing through.

The map remains code-drawn so discovered locations, actual road connections, theme colors and the Station 17 story gate stay accurate. Roads and the positions of fictional locations are schematic, not navigation directions. Run `node tests/map.test.cjs` to check discovery, hidden routes, edge deduplication, marker numbering, bounds and callout overlap. Starting and fully discovered maps have been rendered for visual inspection.

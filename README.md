# Metro 2033 — Interactive Universe Map

An interactive, zero-dependency single-page web application for exploring the **Metro 2033 Universe Map** of post-apocalyptic Moscow and its surrounding surface settlements, based on the novels by Dmitry Glukhovsky and the *Metro* video game series.

---

## Features

- **High-Resolution Vector & Raster Map**: Smooth pan and zoom using scroll wheel, on-screen zoom controls (`+`, `−`, `⌂`), or two-finger pinch-to-zoom on touchscreens.
- **240+ Interactive Stations & Surface Locations**: Clickable markers positioned across all Moscow Metro lines and surrounding Moscow Oblast surface settlements, color-coded by line.
- **Multilingual Instant Search**:
  - Search stations and settlements by **English**, **Russian (Cyrillic)**, or **German** names and aliases (e.g., *VDNKh*, *ВДНХ*, *WDNCh*, *Ausstellung*, *Polis*, *Smaragdstadt*).
  - Filter by controlling **faction or status** (e.g., *Hanza*, *Red Line*, *Fourth Reich*, *Emerald City*, *Baumanskaya Alliance*).
  - Full keyboard navigation (`↑`, `↓`, `Enter`, `Escape`) with ranked exact, prefix, and substring matching plus automatic diacritic/umlaut normalization.
- **Artyom's Journey Mode**: Step-by-step interactive walkthrough of Artyom's canonical 16-stop path in *Metro 2033*—from **VDNKh** through **Polis** to **D-6 (Sportivnaya)**—complete with animated Ranger trail rendering, chapter titles, and camera tracking.
- **Station Lore & Live Wiki Integration**:
  - Built-in universe lore, line badges, Russian subtitles, and faction metadata for every station immediately on selection.
  - Asynchronous live enrichment from the **English Metro Wiki** (`metrovideogame.fandom.com`), **Russian Metro 2033 Wiki** (`metro.fandom.com/ru`), and **Wikipedia**, with automatic SVG station-card fallback and in-memory caching.
  - Responsive layout: side panel on desktop and expandable bottom sheet on mobile viewports.
- **Collapsible Map Legend**: Categorized reference covering Factions & Political Entities, Ideological Groups, Settlements, People & Creatures, Station/Tunnel Status, and Hazards & Anomalies.

---

## Project Structure

```text
.
├── index.html      # Main application shell, search bar, Artyom journey button, modal, and legend
├── styles.css      # Dark post-apocalyptic UI theme, responsive layouts, and animations
├── app.js          # Pan/zoom engine, search ranking, Artyom's Journey state, and MediaWiki API client
├── stations.js     # Coordinates, lines, colors, multilingual aliases (EN/RU/DE), factions, and lore for 244 markers
├── legend.js       # Categorized map legend definitions and renderer
├── plan.svg        # Primary high-resolution vector map of the Metro 2033 universe
└── plan.png        # Raster version of the Metro 2033 universe map
```

---

## Controls & Shortcuts

| Action | Desktop | Mobile / Touch |
| :--- | :--- | :--- |
| **Pan Map** | Click + Drag | One-finger Drag |
| **Zoom Map** | Scroll Wheel or `+` / `−` buttons | Two-finger Pinch or `+` / `−` buttons |
| **Reset View** | Click `⌂` button | Tap `⌂` button |
| **Select Station** | Click station marker or search result | Tap station marker or search result |
| **Expand Details** | Automatic right-hand panel | Tap modal header or `▲` button |
| **Close Details** | Press `Escape` or click `×` | Tap `×` button |
| **Artyom's Journey** | Click **Artyom's Journey** button to advance steps | Tap **Artyom's Journey** button to advance steps |

---

## Credits & Attribution

- **Universe & Lore**: Based on the *Metro 2033* universe created by **Dmitry Glukhovsky** and adapted by **4A Games**.
- **Wiki Data**: Station articles and images fetched dynamically via MediaWiki APIs from the [Metro Wiki](https://metrovideogame.fandom.com/), [Metro 2033 Wiki (RU)](https://metro.fandom.com/ru/), and [Wikipedia](https://en.wikipedia.org/).

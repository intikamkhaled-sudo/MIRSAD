# MIRSAD — Atmospheric Intelligence

MIRSAD is a standalone React + TypeScript weather intelligence dashboard for observation-site assessment. It retrieves hourly meteorological data from Open-Meteo, visualizes key variables, displays the target site on a map, and provides a transparent preliminary weather screening.

## Requirements
- Node.js 20.19+ (or a compatible current LTS release)
- npm

## Run locally
1. Extract the ZIP.
2. Open the extracted `MIRSAD` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build for deployment

```bash
npm run build
npm run preview
```

## Data modes
- **Forecast:** Open-Meteo Forecast API, intended for current/future dates within provider forecast availability.
- **Historical Weather:** Open-Meteo Archive API. Historical values are reanalysis products, not necessarily direct station observations.
- **Historical Forecast:** Open-Meteo Historical Forecast API for archived forecast products. This is not the same as observed weather.

The provider's API availability and supported variables depend on date range and model coverage. The interface reports API errors instead of silently substituting data.

## Scientific interpretation
The decision panel uses simple, visible screening thresholds for cloud cover, visibility, wind, humidity and precipitation. Its score is **not** a probability of crescent visibility, and the thresholds are not a validated operational meteorological standard. Use local observations, model uncertainty, terrain and expert judgment before dispatch decisions. Astronomical crescent visibility is a separate calculation and is intentionally not inferred from weather alone.

## Included
- Responsive dark / gold MIRSAD visual identity
- Latitude, longitude, date and data-mode inputs
- Open-Meteo hourly and daily request fields
- Interactive charts for temperature, cloud layers, visibility, wind, humidity, pressure, precipitation and solar radiation
- OpenStreetMap location map
- Hourly data table and CSV export
- Preliminary weather suitability indicators


## New in this version
- English / Arabic interface toggle with RTL layout; language preference is stored in the browser.
- Installable Progressive Web App (PWA) using `vite-plugin-pwa`, an app manifest, and generated 192px / 512px icons. The app shell can be cached for repeat visits; live weather requests still require connectivity.
- Crescent visibility assessment calculated for local sunset from the selected coordinates and date using Astronomy Engine: sunset and moonset times, lunar age, elongation, moon altitude, ARCV, DAZ, illuminated fraction, crescent width and a Yallop-style q category.

## Crescent visibility methodology and limitations
The lunar assessment uses astronomical ephemeris positions from Astronomy Engine and a Yallop-style empirical q screening. It is an indicative geometric assessment, not a guarantee of naked-eye visibility or an official religious calendar determination. Atmospheric extinction, aerosols/dust, humidity, local horizon obstruction, observer experience, and the exact adopted visibility convention can materially change the outcome. Validate critical observations against authoritative ephemerides and local observing reports. The q class is presented as a planning aid, not a probability.

## PWA install
Run `npm run build` and deploy the generated `dist/` directory over HTTPS (localhost is also supported for development). In a supported browser, use the install icon in the address bar or the browser menu's **Install app** option.


## Brand identity update
- English-only primary MIRSAD logo artwork: `public/branding/mirsad-primary-logo.png`.
- Simplified crescent-and-orbit emblem for app identity: `public/favicon.svg` and `public/icons/`.
- PWA 192px and 512px icons regenerated from the simplified emblem; the PWA manifest references these icons.
- Brand descriptor updated to **ATMOSPHERIC & LUNAR INTELLIGENCE**.

## Integrated Crescent Visibility Engine

The Crescent Visibility tab now presents three layers:

1. **Astronomical assessment** — the existing geometric indicators and Yallop-style class remain visible and unchanged.
2. **Atmospheric assessment** — hourly Open-Meteo samples are selected from local sunset through local moonset (when both events and timestamps are available).
3. **Integrated decision** — a transparent, rule-based suitability index combines the astronomical class (55%) and the observing-window weather screening (45%). Weather inputs currently include total cloud cover, horizontal visibility, relative humidity, wind speed/gusts, and precipitation probability. Low cloud is shown as an additional diagnostic.

The integrated index is an experimental decision-support heuristic, **not** a probability of sighting and not yet calibrated against ground-truth observation reports. It does not change the original Yallop class. Dust/aerosol data are not currently included because the present weather dataset does not provide them. A decision is withheld if the sunset-to-moonset window cannot be matched or fewer than three weather variables are available.

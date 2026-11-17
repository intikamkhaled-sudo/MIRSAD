# RASID — Atmospheric & Lunar Intelligence

RASID is a standalone React + TypeScript dashboard for observation-site assessment. It retrieves hourly meteorological data from Open-Meteo, charts the key variables, shows the target site on a map, and provides a transparent preliminary weather screening. It also calculates crescent visibility for local sunset and combines the result with the weather during the observing window.

## Requirements
- Node.js 20.19+ (or a current LTS release)
- npm

## Run locally
1. Extract the ZIP.
2. Open the extracted `RASID` folder in VS Code.
3. Open a terminal in that folder.
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

`npm run build` runs the TypeScript check (`tsc --noEmit`) and then the Vite production build. Deploy the generated `dist/` directory.

## Data modes
- **Forecast:** Open-Meteo Forecast API. Use it for current and future dates within the provider's forecast range.
- **Historical Weather:** Open-Meteo Archive API. Historical values are reanalysis products, not necessarily direct station observations.
- **Historical Forecast:** Open-Meteo Historical Forecast API, which serves archived forecast products. These are not observed weather.

API availability and supported variables depend on the date range and model coverage. The interface reports API errors instead of substituting data.

## Scientific interpretation
The decision panel applies simple, visible screening thresholds for cloud cover, visibility, wind, humidity and precipitation. Its score is **not** a probability of crescent visibility, and the thresholds are not a validated operational meteorological standard. Use local observations, model uncertainty, terrain and expert judgment before making dispatch decisions. Astronomical crescent visibility is a separate calculation and is not inferred from weather alone.

## Features
- Responsive dark and gold interface
- Latitude, longitude, date and data-mode inputs
- Open-Meteo hourly and daily request fields
- Charts for temperature, cloud layers, visibility, wind, humidity, pressure, precipitation and solar radiation
- OpenStreetMap location map
- Hourly data table with CSV export
- Preliminary weather suitability indicators
- English / Arabic interface with RTL layout. The language preference is stored in the browser.
- Installable Progressive Web App (PWA) built with `vite-plugin-pwa`, with an app manifest and 192 px / 512 px icons. The app shell can be cached for repeat visits; live weather requests still need a connection.
- Crescent visibility assessment for local sunset at the selected coordinates and date, using Astronomy Engine: sunset and moonset times, lunar age, elongation, moon altitude, ARCV, DAZ, illuminated fraction, crescent width and a Yallop-style q category.

## Crescent visibility methodology and limitations
The lunar assessment uses astronomical ephemeris positions from Astronomy Engine and a Yallop-style empirical q screening. It is an indicative geometric assessment. It does not guarantee naked-eye visibility and is not an official religious calendar determination. Atmospheric extinction, aerosols and dust, humidity, local horizon obstruction, observer experience and the visibility convention adopted can all change the outcome. Check critical observations against authoritative ephemerides and local observing reports. The q class is a planning aid, not a probability.

## Integrated crescent visibility engine
The Crescent Visibility tab has three layers:

1. **Astronomical assessment.** The geometric indicators and Yallop-style class are shown unchanged.
2. **Atmospheric assessment.** Hourly Open-Meteo samples are selected from local sunset through local moonset, when both events and matching timestamps are available.
3. **Integrated decision.** A transparent, rule-based suitability index combines the astronomical class (55%) with the weather screening for the observing window (45%). The weather inputs are total cloud cover, horizontal visibility, relative humidity, wind speed and gusts, and precipitation probability. Low cloud is shown as an additional diagnostic.

The integrated index is an experimental decision-support heuristic. It is **not** a probability of sighting and has not been calibrated against ground-truth observation reports. It does not change the original Yallop class. Dust and aerosol data are not included because the current weather dataset does not provide them. No decision is issued if the sunset-to-moonset window cannot be matched or if fewer than three weather variables are available.

## PWA install
Run `npm run build` and deploy the generated `dist/` directory over HTTPS (localhost also works for development). In a supported browser, use the install icon in the address bar or choose **Install app** from the browser menu.

## Brand assets
- `public/favicon.svg`: crescent-and-orbit emblem used in the interface.
- `public/icons/rasid-192.png` and `public/icons/rasid-512.png`: PWA icons (SVG sources are alongside them). The PWA manifest should reference these file names.

## Copyright
© 2026 ENG Khaled Isamil. All Rights Reserved.

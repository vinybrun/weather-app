# Weather

A single-page weather app. Search a city or use your location to see current
conditions, the next 12 hours, and a 7-day forecast.

Data comes from [Open-Meteo](https://open-meteo.com/) (geocoding + forecast).
No API key is required.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
npm start
# or: python3 -m http.server 8760
```

Then visit http://localhost:8760

## Features

- City search with suggestions (arrow keys + Enter to pick)
- Browser geolocation
- Current temperature, feels-like, humidity, wind, precip, high/low
- Hourly forecast with rain chance and a 7-day outlook
- °C / °F toggle (wind follows: km/h or mph; remembered)
- Last place remembered

## Tests

```bash
npm test
```

CI runs the same suite on every push and pull request (GitHub Actions, Node 22).

# Weather

A single-page weather app. Search a city or use your location to see current
conditions, the next 12 hours, and a 7-day forecast.

Forecast and city search come from [Open-Meteo](https://open-meteo.com/).
Near-me place names come from [BigDataCloud](https://www.bigdatacloud.com/)'s
client reverse-geocode endpoint. No API key is required.

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
- Current temperature, feels-like, humidity, wind (speed + direction), precip, high/low
- Hourly forecast with rain chance and a 7-day outlook (high, low, rain chance)
- °C / °F toggle (wind km/h or mph; precip mm or in; remembered)
- Near-me reverse-geocodes to a city name (coordinates if lookup fails)
- Last place remembered

## Tests

```bash
npm test
```

CI runs the same suite on every push and pull request (GitHub Actions, Node 22).

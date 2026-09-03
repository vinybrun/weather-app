# Weather

A single-page weather app. Search a city or use your location to see current
conditions, the next 12 hours, and a 7-day forecast.

Data comes from [Open-Meteo](https://open-meteo.com/) (geocoding + forecast).
No API key is required.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8760
```

Then visit http://localhost:8760

## Features

- City search with suggestions
- Browser geolocation
- Current temperature, feels-like, humidity, wind, high/low
- Hourly and 7-day forecast
- °C / °F toggle (remembered)
- Last place remembered

## Tests

```bash
node --test test/weather.test.js
```

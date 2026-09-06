# Weather

A single-page weather app. Search a city or use your location to see current
conditions, the next 12 hours, and a 7-day forecast.

Forecast, city search, and US AQI come from [Open-Meteo](https://open-meteo.com/).
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
- Browser geolocation with reverse-geocoded place names
- Current temperature, feels-like, humidity, dew point, wind (speed, direction, gusts),
  precip, next expected precipitation, high/low, sunrise/sunset, UV, pressure,
  visibility, and US AQI
- Next 12 hours and a 7-day outlook (Today/Tomorrow labels)
- Times shown in the place timezone
- °C / °F toggle (wind km/h or mph; precip mm or in; visibility km or mi)
- Shareable forecast URLs (`?lat=&lon=&name=` or `?q=Paris`) plus a Copy link button
- Last place and recent searches remembered

## Tests

```bash
npm test
```

CI runs the same suite on every push and pull request (GitHub Actions, Node 22).

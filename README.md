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
- Browser geolocation
- Current temperature, feels-like, humidity (with dry/comfortable/humid/muggy), wind (speed + direction + gusts), precip, high/low, sunrise/sunset, daylight length, UV, dew point, pressure, visibility, cloud cover, US AQI + PM2.5
- Night-aware icons for clear and partly cloudy hours
- Hourly forecast with feels-like, wind (speed + direction + gusts), humidity, UV, cloud cover, visibility, dew point, wet-bulb, pressure, rain chance + amount + snowfall and a 7-day outlook (Today/Tomorrow, high, low, feels-like high/low, peak wind, peak gusts, peak UV, sunrise–sunset, sunshine duration, solar radiation, evapotranspiration, humidity range, convective showers, hours of rain, rain chance + daily precip + snowfall)
- Times shown in the place timezone (not the browser timezone)
- °C / °F toggle (wind km/h or mph; precip mm or in; snowfall cm or in; visibility km or mi; ET0 mm or in; remembered)
- Near-me reverse-geocodes to a city name (coordinates if lookup fails)
- Last place remembered
- Recent places (up to 5, one-tap chips)
- Refresh the current forecast without searching again

## Tests

```bash
npm test
```

CI runs the same suite on every push and pull request (GitHub Actions, Node 22).

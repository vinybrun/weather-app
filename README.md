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
- Hourly forecast with feels-like, wind (speed + direction + gusts), humidity, UV, clear-sky UV, cloud cover, visibility, dew point, wet-bulb, pressure, surface pressure, rain chance + amount + snowfall + showers + rain + snow depth + CAPE + convective inhibition + boundary layer height + vapour pressure deficit + sunshine duration + shortwave radiation + direct radiation + ET0 + evapotranspiration + freezing level + soil temperature + 6cm soil temperature + 18cm soil temperature + 54cm soil temperature + lifted index + soil moisture + 1–3cm soil moisture + 3–9cm soil moisture + 9–27cm soil moisture + 27–81cm soil moisture + low cloud cover + mid cloud cover + high cloud cover and a 7-day outlook (Today/Tomorrow, high, low, mean, feels-like high/low/mean, mean dew point, peak dew point, minimum dew point, peak CAPE, minimum CAPE, mean CAPE, peak VPD, peak wet-bulb, minimum wet-bulb, mean wet-bulb, peak wind, minimum wind, mean wind, dominant wind direction, peak gusts, minimum gusts, mean gusts, peak UV, clear-sky UV, sunrise–sunset, sunshine duration, daylight duration, solar radiation, evapotranspiration, humidity range, mean humidity, convective showers, liquid rain, hours of rain, rain chance + mean rain chance + min rain chance + daily precip + snowfall + mean visibility + mean sea-level pressure + mean cloud cover + minimum cloud cover + maximum cloud cover + mean surface pressure)
- Times shown in the place timezone (not the browser timezone)
- °C / °F toggle (wind km/h or mph; precip mm or in; snowfall cm or in; visibility km or mi; ET0 mm or in; remembered)
- Near-me reverse-geocodes to a city name (coordinates if lookup fails)
- Last place remembered
- Recent places (up to 5, one-tap chips)
- Refresh the current forecast without searching again
- Shareable forecast URLs (`?lat=&lon=&name=` or `?q=Paris`) plus a Copy link button

## Tests

```bash
npm test
```

CI runs the same suite on every push and pull request (GitHub Actions, Node 22).

import test from "node:test";
import assert from "node:assert/strict";
import {
  describeWeather,
  cToF,
  formatTemp,
  placeLabel,
  kmhToMph,
  formatWind,
  formatWindDir,
  formatPrecip,
  formatChance,
  formatCoords,
  placeFromGeolocation,
  placeFromReverse,
  mmToIn,
  nextHours,
  dateKey,
  nextDateKey,
  forecastDayName,
  formatSunTime,
  formatSunRange,
  daylightMinutes,
  formatDaylight,
  humidityComfort,
  formatHumidity,
  uvRisk,
  formatUv,
  clockMinutes,
  isNight,
  dailyIndexForTime,
  aqiLabel,
  formatAqi,
  hPaToInHg,
  formatPressure,
  formatPm25,
  formatAqiDetail,
  formatVisibility,
  dailyPrecipParts,
  cmToIn,
  formatSnowfall,
  dailySnowAmount,
  parseIsoParts,
  formatHourLabel,
  formatUpdatedAt,
  placeKey,
  parseRecents,
  rememberRecent,
  MAX_RECENTS,
  cloudCoverLabel,
  formatCloud,
  formatFeelsLike,
  hourlyWindLabel,
  dailyUvLabel,
  hourlyHumidityLabel,
  dailySunLabel,
  hourlyUvLabel,
  dailyFeelsTemp,
  hourlyCloudLabel,
  formatSunshine,
  dailySunshineLabel,
  hourlyVisibilityLabel,
  formatPrecipHours,
  dailyPrecipHoursLabel,
  hourlyDewLabel,
  formatGusts,
  dailyGustLabel,
  hourlyPressureLabel,
  formatSolar,
  dailySolarLabel,
  hourlyGustLabel,
  formatEt0,
  dailyEt0Label,
  hourlyWetBulbLabel,
  formatHumidityRange,
  dailyHumidityLabel,
  hourlySnowLabel,
  formatShowers,
  dailyShowersLabel,
  hourlyShowersLabel,
  formatRain,
  dailyRainLabel,
  hourlyRainLabel,
  dailyMeanTempLabel,
  formatSnowDepth,
  hourlySnowDepthLabel,
  dailyFeelsMeanLabel,
  formatCape,
  hourlyCapeLabel,
  dailyDewMeanLabel,
  formatVpd,
  hourlyVpdLabel,
  dailyCapeMaxLabel,
  hourlySunshineLabel,
  formatDaylightDuration,
  dailyDaylightLabel,
  formatShortwave,
  hourlyShortwaveLabel,
  dailyClearSkyUvLabel,
  hourlyEt0Label,
  dailyWindMinLabel,
  formatEvapotranspiration,
  hourlyEtLabel,
  dailyVpdMaxLabel,
  formatFreezingLevel,
  hourlyFreezingLevelLabel,
  dailyPrecipMeanLabel,
  hourlySoilTempLabel,
  dailyHumidityMeanLabel,
  dailyWetBulbMaxLabel,
  formatLiftedIndex,
  hourlyLiftedIndexLabel,
  dailyPrecipMinLabel,
  formatSoilMoisture,
  hourlySoilMoistureLabel,
  dailyDewMaxLabel,
  formatSoilMoisture13,
  hourlySoilMoisture13Label,
  dailyDewMinLabel,
  formatSoilMoisture39,
  hourlySoilMoisture39Label,
  dailyWetBulbMinLabel,
  formatSoilMoisture927,
  hourlySoilMoisture927Label,
  dailyWindMeanLabel,
  formatSoilMoisture2781,
  hourlySoilMoisture2781Label,
  dailyCapeMinLabel,
  hourlySoilTemp6Label,
  dailyWetBulbMeanLabel,
} from "../app.js";

test("maps known WMO codes", () => {
  assert.equal(describeWeather(0).label, "Clear sky");
  assert.equal(describeWeather(0).icon, "☀️");
  assert.equal(describeWeather(95).icon, "⛈️");
  assert.equal(describeWeather(0, true).icon, "🌙");
  assert.equal(describeWeather(1, true).icon, "🌙");
  assert.equal(describeWeather(2, true).icon, "☁️");
  assert.equal(describeWeather(95, true).icon, "⛈️");
});

test("unknown codes have a fallback", () => {
  const unknown = describeWeather(1234);
  assert.match(unknown.label, /unknown/i);
});

test("converts celsius to fahrenheit", () => {
  assert.equal(cToF(0), 32);
  assert.equal(cToF(100), 212);
});

test("formats temperatures in both units", () => {
  assert.equal(formatTemp(21.4, "c"), "21°C");
  assert.equal(formatTemp(20, "f"), "68°F");
});

test("builds a place label", () => {
  assert.equal(
    placeLabel({ name: "Porto Alegre", admin1: "Rio Grande do Sul", country: "Brazil" }),
    "Porto Alegre, Rio Grande do Sul, Brazil",
  );
  assert.equal(placeLabel({ name: "Lisbon", country: "Portugal" }), "Lisbon, Portugal");
});

test("converts wind to mph when unit is fahrenheit", () => {
  assert.equal(Math.round(kmhToMph(16.0934)), 10);
  assert.equal(formatWind(16, "c"), "16 km/h");
  assert.equal(formatWind(16, "f"), "10 mph");
});

test("appends a compass direction to wind", () => {
  assert.equal(formatWindDir(0), "N");
  assert.equal(formatWindDir(360), "N");
  assert.equal(formatWindDir(90), "E");
  assert.equal(formatWindDir(225), "SW");
  assert.equal(formatWind(16, "c", 180), "16 km/h S");
  assert.equal(formatWind(16, "c", 180, 28), "16 km/h S · gusts 28 km/h");
  assert.equal(formatWind(16, "f", 180, 32), "10 mph S · gusts 20 mph");
  assert.equal(formatWindDir(null), "");
});

test("formats precipitation amounts", () => {
  assert.equal(formatPrecip(0), "0 mm");
  assert.equal(formatPrecip(1.24), "1.2 mm");
  assert.equal(formatPrecip(null), "—");
  assert.equal(formatPrecip(0, "f"), "0 in");
  assert.equal(formatPrecip(25.4, "f"), "1 in");
  assert.ok(Math.abs(mmToIn(25.4) - 1) < 1e-9);
});

test("formats rain chance and geolocation labels", () => {
  assert.equal(formatChance(41.6), "42%");
  assert.equal(formatChance(null), "");
  assert.equal(formatCoords(37.7749, -122.4194), "37.77°N, 122.42°W");
  assert.equal(formatCoords(-33.86, 151.21), "33.86°S, 151.21°E");
  assert.equal(
    placeLabel(placeFromGeolocation(-30.03, -51.23)),
    "Your location, 30.03°S, 51.23°W",
  );
});

test("builds a place name from reverse geocode", () => {
  assert.equal(
    placeLabel(
      placeFromReverse({
        city: "San Francisco",
        principalSubdivision: "California",
        countryName: "United States of America",
        latitude: 37.77,
        longitude: -122.42,
      }),
    ),
    "San Francisco, California, United States of America",
  );
  assert.equal(
    placeFromReverse({ locality: "Mission-Bernal", latitude: 1, longitude: 2 }).name,
    "Mission-Bernal",
  );
  assert.equal(
    placeLabel(placeFromReverse({}, { latitude: -30.03, longitude: -51.23 })),
    "Your location, 30.03°S, 51.23°W",
  );
  assert.equal(
    placeLabel(
      placeFromReverse({
        principalSubdivision: "California",
        countryName: "United States of America",
        latitude: 36.7,
        longitude: -119.4,
      }),
    ),
    "California, United States of America",
  );
  assert.equal(
    placeFromReverse({
      city: "Singapore",
      principalSubdivision: "Singapore",
      countryName: "Singapore",
      latitude: 1.35,
      longitude: 103.82,
    }).admin1,
    undefined,
  );
});

test("selects the next upcoming hourly slots", () => {
  const hourly = {
    time: [
      "2026-09-05T10:00",
      "2026-09-05T11:00",
      "2026-09-05T12:00",
      "2026-09-05T13:00",
    ],
    temperature_2m: [18, 19, 20, 21],
    weather_code: [0, 1, 2, 3],
    precipitation_probability: [0, 10, 20, 30],
    precipitation: [0, 0.2, 1.4, 0],
    apparent_temperature: [17, 18, 19, 20],
    wind_speed_10m: [8, 10, 12, 14],
    wind_direction_10m: [180, 200, 220, 240],
    relative_humidity_2m: [55, 58, 61, 64],
    uv_index: [1.2, 3.6, 6.4, 8.1],
    cloud_cover: [10, 25, 55, 90],
    visibility: [10000, 2400, 500, 16093],
    dew_point_2m: [10, 11.4, 12, 13],
    pressure_msl: [1012, 1013.2, 1014, 1015],
    wind_gusts_10m: [12, 18, 14, 20],
    wet_bulb_temperature_2m: [14, 15.6, 16, 17],
    snowfall: [0, 0.4, 1.2, 0],
    showers: [0, 0.6, 2.4, 0],
    rain: [0, 0.8, 3.2, 0],
    snow_depth: [0, 0.024, 0.12, 0],
    cape: [0, 450, 1200, 80],
    vapour_pressure_deficit: [0, 0.38, 1.2, 0.05],
    sunshine_duration: [0, 18 * 60, 45 * 60, 0],
    shortwave_radiation: [0, 129, 420.4, 0],
    et0_fao_evapotranspiration: [0, 0.17, 0.44, 0],
    evapotranspiration: [0, 0.4, 1.2, 0],
    freezing_level_height: [3200, 4210.4, 3800, 2900],
    soil_temperature_0cm: [14, 15.6, 18, 16],
    soil_temperature_6cm: [13, 14.6, 17, 15],
    lifted_index: [12, 9.84, -1.2, 4],
    soil_moisture_0_to_1cm: [0.12, 0.284, 0.4, 0],
    soil_moisture_1_to_3cm: [0.18, 0.316, 0.4, 0],
    soil_moisture_3_to_9cm: [0.22, 0.348, 0.4, 0],
    soil_moisture_9_to_27cm: [0.26, 0.372, 0.4, 0],
    soil_moisture_27_to_81cm: [0.28, 0.396, 0.4, 0],
  };
  const now = Date.parse("2026-09-05T11:00:00");
  const hours = nextHours(hourly, now, 2);
  assert.equal(hours.length, 2);
  assert.equal(hours[0].time, "2026-09-05T11:00");
  assert.equal(hours[0].temp, 19);
  assert.equal(hours[0].feels, 18);
  assert.equal(hours[0].wind, 10);
  assert.equal(hours[0].dir, 200);
  assert.equal(hours[0].humidity, 58);
  assert.equal(hours[0].uv, 3.6);
  assert.equal(hours[0].cloud, 25);
  assert.equal(hours[0].visibility, 2400);
  assert.equal(hours[0].dew, 11.4);
  assert.equal(hours[0].pressure, 1013.2);
  assert.equal(hours[0].gust, 18);
  assert.equal(hours[0].wet, 15.6);
  assert.equal(hours[0].snow, 0.4);
  assert.equal(hours[0].showers, 0.6);
  assert.equal(hours[0].rain, 0.8);
  assert.equal(hours[0].depth, 0.024);
  assert.equal(hours[0].cape, 450);
  assert.equal(hours[0].vpd, 0.38);
  assert.equal(hours[0].shine, 18 * 60);
  assert.equal(hours[0].sw, 129);
  assert.equal(hours[0].et0, 0.17);
  assert.equal(hours[0].et, 0.4);
  assert.equal(hours[0].fzl, 4210.4);
  assert.equal(hours[0].soil, 15.6);
  assert.equal(hours[0].soil6, 14.6);
  assert.equal(hours[0].li, 9.84);
  assert.equal(hours[0].moist, 0.284);
  assert.equal(hours[0].moist13, 0.316);
  assert.equal(hours[0].moist39, 0.348);
  assert.equal(hours[0].moist927, 0.372);
  assert.equal(hours[0].moist2781, 0.396);
  assert.equal(hours[0].amount, 0.2);
  assert.equal(hours[1].precip, 20);
  assert.equal(hours[1].amount, 1.4);
  assert.deepEqual(nextHours(null, now), []);
});

test("formats hourly feels-like labels", () => {
  assert.equal(formatFeelsLike(18.4, "c"), "feels 18°C");
  assert.equal(formatFeelsLike(20, "f"), "feels 68°F");
  assert.equal(formatFeelsLike(null), "");
  assert.equal(formatFeelsLike(Number.NaN), "");
});

test("formats hourly wind and daily UV labels", () => {
  assert.equal(hourlyWindLabel(16, "c", 180), "16 km/h S");
  assert.equal(hourlyWindLabel(16, "f", 90), "10 mph E");
  assert.equal(hourlyWindLabel(null), "");
  assert.equal(hourlyWindLabel(Number.NaN), "");
  assert.equal(dailyUvLabel(6.4), "6 High");
  assert.equal(dailyUvLabel(1.2), "1 Low");
  assert.equal(dailyUvLabel(null), "");
  assert.equal(dailyUvLabel(Number.NaN), "");
});

test("formats hourly humidity and daily sun labels", () => {
  assert.equal(hourlyHumidityLabel(41.6), "42%");
  assert.equal(hourlyHumidityLabel(0), "0%");
  assert.equal(hourlyHumidityLabel(null), "");
  assert.equal(hourlyHumidityLabel(Number.NaN), "");
  assert.equal(
    dailySunLabel("2026-09-05T06:42", "2026-09-05T19:15"),
    "6:42 AM – 7:15 PM",
  );
  assert.equal(dailySunLabel(null, null), "");
  assert.equal(dailySunLabel("2026-09-05", "2026-09-05"), "");
});

test("formats hourly UV and daily feels-like temps", () => {
  assert.equal(hourlyUvLabel(6.4), "UV 6");
  assert.equal(hourlyUvLabel(0.4), "");
  assert.equal(hourlyUvLabel(0), "");
  assert.equal(hourlyUvLabel(null), "");
  assert.equal(hourlyUvLabel(Number.NaN), "");
  assert.equal(dailyFeelsTemp(27.6, "c"), "28°C");
  assert.equal(dailyFeelsTemp(20, "f"), "68°F");
  assert.equal(dailyFeelsTemp(null), "");
  assert.equal(dailyFeelsTemp(Number.NaN), "");
});

test("formats hourly cloud cover and daily sunshine duration", () => {
  assert.equal(hourlyCloudLabel(48), "48% Partly cloudy");
  assert.equal(hourlyCloudLabel(5), "5% Clear");
  assert.equal(hourlyCloudLabel(null), "");
  assert.equal(hourlyCloudLabel(Number.NaN), "");
  assert.equal(formatSunshine(12 * 3600 + 30 * 60), "12h 30m sun");
  assert.equal(formatSunshine(8 * 3600), "8h sun");
  assert.equal(formatSunshine(45 * 60), "45m sun");
  assert.equal(formatSunshine(0), "0h sun");
  assert.equal(formatSunshine(null), "—");
  assert.equal(dailySunshineLabel(8 * 3600), "8h sun");
  assert.equal(dailySunshineLabel(null), "");
  assert.equal(dailySunshineLabel(Number.NaN), "");
});

test("formats hourly visibility and daily precipitation hours", () => {
  assert.equal(hourlyVisibilityLabel(10000, "c"), "10 km");
  assert.equal(hourlyVisibilityLabel(2400, "c"), "2.4 km");
  assert.equal(hourlyVisibilityLabel(16093.44, "f"), "10 mi");
  assert.equal(hourlyVisibilityLabel(null), "");
  assert.equal(hourlyVisibilityLabel(Number.NaN), "");
  assert.equal(formatPrecipHours(4), "4h rain");
  assert.equal(formatPrecipHours(2.4), "2.4h rain");
  assert.equal(formatPrecipHours(0), "0h rain");
  assert.equal(formatPrecipHours(null), "—");
  assert.equal(dailyPrecipHoursLabel(4), "4h rain");
  assert.equal(dailyPrecipHoursLabel(0), "");
  assert.equal(dailyPrecipHoursLabel(null), "");
  assert.equal(dailyPrecipHoursLabel(Number.NaN), "");
});

test("formats hourly dew point and daily peak gusts", () => {
  assert.equal(hourlyDewLabel(11.4, "c"), "dew 11°C");
  assert.equal(hourlyDewLabel(20, "f"), "dew 68°F");
  assert.equal(hourlyDewLabel(null), "");
  assert.equal(hourlyDewLabel(Number.NaN), "");
  assert.equal(formatGusts(28, "c"), "gusts 28 km/h");
  assert.equal(formatGusts(32, "f"), "gusts 20 mph");
  assert.equal(formatGusts(null), "—");
  assert.equal(dailyGustLabel(28, 16, "c"), "gusts 28 km/h");
  assert.equal(dailyGustLabel(32, 16, "f"), "gusts 20 mph");
  assert.equal(dailyGustLabel(16, 16, "c"), "");
  assert.equal(dailyGustLabel(12, 16, "c"), "");
  assert.equal(dailyGustLabel(0, null, "c"), "");
  assert.equal(dailyGustLabel(28, null, "c"), "gusts 28 km/h");
  assert.equal(dailyGustLabel(null, 16), "");
  assert.equal(dailyGustLabel(Number.NaN, 16), "");
});

test("formats hourly pressure and daily solar radiation", () => {
  assert.equal(hourlyPressureLabel(1013.2, "c"), "1013 hPa");
  assert.equal(hourlyPressureLabel(1013.25, "f"), "29.92 inHg");
  assert.equal(hourlyPressureLabel(null), "");
  assert.equal(hourlyPressureLabel(Number.NaN), "");
  assert.equal(formatSolar(18.4), "18.4 MJ/m²");
  assert.equal(formatSolar(8), "8 MJ/m²");
  assert.equal(formatSolar(0), "0 MJ/m²");
  assert.equal(formatSolar(null), "—");
  assert.equal(dailySolarLabel(18.4), "18.4 MJ/m²");
  assert.equal(dailySolarLabel(0), "");
  assert.equal(dailySolarLabel(null), "");
  assert.equal(dailySolarLabel(Number.NaN), "");
});

test("formats hourly gusts and daily evapotranspiration", () => {
  assert.equal(hourlyGustLabel(28, 16, "c"), "gusts 28 km/h");
  assert.equal(hourlyGustLabel(32, 16, "f"), "gusts 20 mph");
  assert.equal(hourlyGustLabel(16, 16, "c"), "");
  assert.equal(hourlyGustLabel(12, 16, "c"), "");
  assert.equal(hourlyGustLabel(0, null, "c"), "");
  assert.equal(hourlyGustLabel(null, 16), "");
  assert.equal(hourlyGustLabel(Number.NaN, 16), "");
  assert.equal(formatEt0(4.2, "c"), "4.2 mm ET0");
  assert.equal(formatEt0(5, "c"), "5 mm ET0");
  assert.equal(formatEt0(25.4, "f"), "1 in ET0");
  assert.equal(formatEt0(0, "c"), "0 mm ET0");
  assert.equal(formatEt0(0, "f"), "0 in ET0");
  assert.equal(formatEt0(null), "—");
  assert.equal(dailyEt0Label(4.2, "c"), "4.2 mm ET0");
  assert.equal(dailyEt0Label(25.4, "f"), "1 in ET0");
  assert.equal(dailyEt0Label(0, "c"), "");
  assert.equal(dailyEt0Label(null), "");
  assert.equal(dailyEt0Label(Number.NaN), "");
});

test("formats hourly wet-bulb and daily humidity range", () => {
  assert.equal(hourlyWetBulbLabel(15.6, "c"), "wet 16°C");
  assert.equal(hourlyWetBulbLabel(20, "f"), "wet 68°F");
  assert.equal(hourlyWetBulbLabel(null), "");
  assert.equal(hourlyWetBulbLabel(Number.NaN), "");
  assert.equal(formatHumidityRange(72.4, 41.6), "42–72%");
  assert.equal(formatHumidityRange(50, 50), "50%");
  assert.equal(formatHumidityRange(80, null), "80%");
  assert.equal(formatHumidityRange(null, 30), "30%");
  assert.equal(formatHumidityRange(null, null), "—");
  assert.equal(formatHumidityRange(Number.NaN, Number.NaN), "—");
  assert.equal(dailyHumidityLabel(72.4, 41.6), "42–72%");
  assert.equal(dailyHumidityLabel(50, 50), "50%");
  assert.equal(dailyHumidityLabel(null, null), "");
  assert.equal(dailyHumidityLabel(Number.NaN, Number.NaN), "");
});

test("formats hourly snowfall and daily showers", () => {
  assert.equal(hourlySnowLabel(0.4, "c"), "0.4 cm snow");
  assert.equal(hourlySnowLabel(2.54, "f"), "1 in snow");
  assert.equal(hourlySnowLabel(0, "c"), "");
  assert.equal(hourlySnowLabel(null), "");
  assert.equal(hourlySnowLabel(Number.NaN), "");
  assert.equal(formatShowers(2.4, "c"), "2.4 mm showers");
  assert.equal(formatShowers(5, "c"), "5 mm showers");
  assert.equal(formatShowers(25.4, "f"), "1 in showers");
  assert.equal(formatShowers(0, "c"), "0 mm showers");
  assert.equal(formatShowers(0, "f"), "0 in showers");
  assert.equal(formatShowers(null), "—");
  assert.equal(dailyShowersLabel(2.4, "c"), "2.4 mm showers");
  assert.equal(dailyShowersLabel(25.4, "f"), "1 in showers");
  assert.equal(dailyShowersLabel(0, "c"), "");
  assert.equal(dailyShowersLabel(null), "");
  assert.equal(dailyShowersLabel(Number.NaN), "");
});

test("formats hourly showers and daily rain", () => {
  assert.equal(hourlyShowersLabel(0.6, "c"), "0.6 mm showers");
  assert.equal(hourlyShowersLabel(25.4, "f"), "1 in showers");
  assert.equal(hourlyShowersLabel(0, "c"), "");
  assert.equal(hourlyShowersLabel(null), "");
  assert.equal(hourlyShowersLabel(Number.NaN), "");
  assert.equal(formatRain(3.2, "c"), "3.2 mm rain");
  assert.equal(formatRain(5, "c"), "5 mm rain");
  assert.equal(formatRain(25.4, "f"), "1 in rain");
  assert.equal(formatRain(0, "c"), "0 mm rain");
  assert.equal(formatRain(0, "f"), "0 in rain");
  assert.equal(formatRain(null), "—");
  assert.equal(dailyRainLabel(3.2, "c"), "3.2 mm rain");
  assert.equal(dailyRainLabel(25.4, "f"), "1 in rain");
  assert.equal(dailyRainLabel(0, "c"), "");
  assert.equal(dailyRainLabel(null), "");
  assert.equal(dailyRainLabel(Number.NaN), "");
});

test("formats hourly rain and daily mean temperature", () => {
  assert.equal(hourlyRainLabel(0.8, "c"), "0.8 mm rain");
  assert.equal(hourlyRainLabel(25.4, "f"), "1 in rain");
  assert.equal(hourlyRainLabel(0, "c"), "");
  assert.equal(hourlyRainLabel(null), "");
  assert.equal(hourlyRainLabel(Number.NaN), "");
  assert.equal(dailyMeanTempLabel(18.4, "c"), "mean 18°C");
  assert.equal(dailyMeanTempLabel(20, "f"), "mean 68°F");
  assert.equal(dailyMeanTempLabel(null), "");
  assert.equal(dailyMeanTempLabel(Number.NaN), "");
});

test("formats hourly snow depth and daily feels-like mean", () => {
  assert.equal(formatSnowDepth(0.024, "c"), "2.4 cm");
  assert.equal(formatSnowDepth(0.0254, "f"), "1 in");
  assert.equal(formatSnowDepth(0, "c"), "0 cm");
  assert.equal(formatSnowDepth(0, "f"), "0 in");
  assert.equal(formatSnowDepth(null), "—");
  assert.equal(hourlySnowDepthLabel(0.024, "c"), "2.4 cm depth");
  assert.equal(hourlySnowDepthLabel(0.0254, "f"), "1 in depth");
  assert.equal(hourlySnowDepthLabel(0, "c"), "");
  assert.equal(hourlySnowDepthLabel(null), "");
  assert.equal(hourlySnowDepthLabel(Number.NaN), "");
  assert.equal(dailyFeelsMeanLabel(18.4, "c"), "feels mean 18°C");
  assert.equal(dailyFeelsMeanLabel(20, "f"), "feels mean 68°F");
  assert.equal(dailyFeelsMeanLabel(null), "");
  assert.equal(dailyFeelsMeanLabel(Number.NaN), "");
});

test("formats hourly CAPE and daily mean dew point", () => {
  assert.equal(formatCape(450.4), "450 J/kg");
  assert.equal(formatCape(0), "0 J/kg");
  assert.equal(formatCape(null), "—");
  assert.equal(hourlyCapeLabel(450.4), "450 J/kg");
  assert.equal(hourlyCapeLabel(0), "");
  assert.equal(hourlyCapeLabel(null), "");
  assert.equal(hourlyCapeLabel(Number.NaN), "");
  assert.equal(dailyDewMeanLabel(11.4, "c"), "mean dew 11°C");
  assert.equal(dailyDewMeanLabel(20, "f"), "mean dew 68°F");
  assert.equal(dailyDewMeanLabel(null), "");
  assert.equal(dailyDewMeanLabel(Number.NaN), "");
});

test("formats hourly VPD and daily peak CAPE", () => {
  assert.equal(formatVpd(0.384), "0.38 kPa");
  assert.equal(formatVpd(1), "1 kPa");
  assert.equal(formatVpd(0), "0 kPa");
  assert.equal(formatVpd(null), "—");
  assert.equal(hourlyVpdLabel(0.384), "0.38 kPa");
  assert.equal(hourlyVpdLabel(0), "");
  assert.equal(hourlyVpdLabel(null), "");
  assert.equal(hourlyVpdLabel(Number.NaN), "");
  assert.equal(dailyCapeMaxLabel(560.4), "CAPE 560 J/kg");
  assert.equal(dailyCapeMaxLabel(0), "");
  assert.equal(dailyCapeMaxLabel(null), "");
  assert.equal(dailyCapeMaxLabel(Number.NaN), "");
});

test("formats hourly sunshine and daily daylight duration", () => {
  assert.equal(hourlySunshineLabel(45 * 60), "45m sun");
  assert.equal(hourlySunshineLabel(8 * 3600), "8h sun");
  assert.equal(hourlySunshineLabel(12 * 3600 + 30 * 60), "12h 30m sun");
  assert.equal(hourlySunshineLabel(0), "");
  assert.equal(hourlySunshineLabel(null), "");
  assert.equal(hourlySunshineLabel(Number.NaN), "");
  assert.equal(formatDaylightDuration(12 * 3600 + 33 * 60), "12h 33m day");
  assert.equal(formatDaylightDuration(8 * 3600), "8h day");
  assert.equal(formatDaylightDuration(45 * 60), "45m day");
  assert.equal(formatDaylightDuration(0), "0h day");
  assert.equal(formatDaylightDuration(null), "—");
  assert.equal(dailyDaylightLabel(12 * 3600 + 33 * 60), "12h 33m day");
  assert.equal(dailyDaylightLabel(8 * 3600), "8h day");
  assert.equal(dailyDaylightLabel(0), "");
  assert.equal(dailyDaylightLabel(null), "");
  assert.equal(dailyDaylightLabel(Number.NaN), "");
});

test("formats hourly shortwave radiation and daily clear-sky UV", () => {
  assert.equal(formatShortwave(420.4), "420 W/m²");
  assert.equal(formatShortwave(53), "53 W/m²");
  assert.equal(formatShortwave(0), "0 W/m²");
  assert.equal(formatShortwave(null), "—");
  assert.equal(hourlyShortwaveLabel(420.4), "420 W/m²");
  assert.equal(hourlyShortwaveLabel(0), "");
  assert.equal(hourlyShortwaveLabel(null), "");
  assert.equal(hourlyShortwaveLabel(Number.NaN), "");
  assert.equal(dailyClearSkyUvLabel(8.4), "clear UV 8");
  assert.equal(dailyClearSkyUvLabel(1.2), "clear UV 1");
  assert.equal(dailyClearSkyUvLabel(0), "");
  assert.equal(dailyClearSkyUvLabel(null), "");
  assert.equal(dailyClearSkyUvLabel(Number.NaN), "");
});

test("formats hourly ET0 and daily minimum wind", () => {
  assert.equal(hourlyEt0Label(0.17, "c"), "0.2 mm ET0");
  assert.equal(hourlyEt0Label(25.4, "f"), "1 in ET0");
  assert.equal(hourlyEt0Label(0, "c"), "");
  assert.equal(hourlyEt0Label(null), "");
  assert.equal(hourlyEt0Label(Number.NaN), "");
  assert.equal(dailyWindMinLabel(6.9, "c"), "min 7 km/h");
  assert.equal(dailyWindMinLabel(16.0934, "f"), "min 10 mph");
  assert.equal(dailyWindMinLabel(0, "c"), "min 0 km/h");
  assert.equal(dailyWindMinLabel(null), "");
  assert.equal(dailyWindMinLabel(Number.NaN), "");
});

test("formats hourly evapotranspiration and daily peak VPD", () => {
  assert.equal(formatEvapotranspiration(0.4, "c"), "0.4 mm ET");
  assert.equal(formatEvapotranspiration(5, "c"), "5 mm ET");
  assert.equal(formatEvapotranspiration(25.4, "f"), "1 in ET");
  assert.equal(formatEvapotranspiration(0, "c"), "0 mm ET");
  assert.equal(formatEvapotranspiration(0, "f"), "0 in ET");
  assert.equal(formatEvapotranspiration(null), "—");
  assert.equal(hourlyEtLabel(0.4, "c"), "0.4 mm ET");
  assert.equal(hourlyEtLabel(25.4, "f"), "1 in ET");
  assert.equal(hourlyEtLabel(0, "c"), "");
  assert.equal(hourlyEtLabel(null), "");
  assert.equal(hourlyEtLabel(Number.NaN), "");
  assert.equal(dailyVpdMaxLabel(1.04), "VPD 1.04 kPa");
  assert.equal(dailyVpdMaxLabel(1), "VPD 1 kPa");
  assert.equal(dailyVpdMaxLabel(0), "");
  assert.equal(dailyVpdMaxLabel(null), "");
  assert.equal(dailyVpdMaxLabel(Number.NaN), "");
});

test("formats hourly freezing level and daily mean rain chance", () => {
  assert.equal(formatFreezingLevel(4210.4, "c"), "4210 m FZL");
  assert.equal(formatFreezingLevel(1000, "f"), "3281 ft FZL");
  assert.equal(formatFreezingLevel(0, "c"), "0 m FZL");
  assert.equal(formatFreezingLevel(null), "—");
  assert.equal(hourlyFreezingLevelLabel(4210.4, "c"), "4210 m FZL");
  assert.equal(hourlyFreezingLevelLabel(1000, "f"), "3281 ft FZL");
  assert.equal(hourlyFreezingLevelLabel(0, "c"), "0 m FZL");
  assert.equal(hourlyFreezingLevelLabel(null), "");
  assert.equal(hourlyFreezingLevelLabel(Number.NaN), "");
  assert.equal(dailyPrecipMeanLabel(41.6), "mean 42%");
  assert.equal(dailyPrecipMeanLabel(0), "mean 0%");
  assert.equal(dailyPrecipMeanLabel(null), "");
  assert.equal(dailyPrecipMeanLabel(Number.NaN), "");
});

test("formats hourly soil temperature and daily mean humidity", () => {
  assert.equal(hourlySoilTempLabel(15.6, "c"), "soil 16°C");
  assert.equal(hourlySoilTempLabel(20, "f"), "soil 68°F");
  assert.equal(hourlySoilTempLabel(null), "");
  assert.equal(hourlySoilTempLabel(Number.NaN), "");
  assert.equal(dailyHumidityMeanLabel(79.4), "mean 79%");
  assert.equal(dailyHumidityMeanLabel(50), "mean 50%");
  assert.equal(dailyHumidityMeanLabel(null), "");
  assert.equal(dailyHumidityMeanLabel(Number.NaN), "");
});

test("formats daily peak wet-bulb", () => {
  assert.equal(dailyWetBulbMaxLabel(18.6, "c"), "wet max 19°C");
  assert.equal(dailyWetBulbMaxLabel(20, "f"), "wet max 68°F");
  assert.equal(dailyWetBulbMaxLabel(null), "");
  assert.equal(dailyWetBulbMaxLabel(Number.NaN), "");
});

test("formats hourly lifted index and daily minimum rain chance", () => {
  assert.equal(formatLiftedIndex(9.84), "LI 9.8");
  assert.equal(formatLiftedIndex(-1.2), "LI -1.2");
  assert.equal(formatLiftedIndex(0), "LI 0");
  assert.equal(formatLiftedIndex(null), "—");
  assert.equal(hourlyLiftedIndexLabel(9.84), "LI 9.8");
  assert.equal(hourlyLiftedIndexLabel(-1.2), "LI -1.2");
  assert.equal(hourlyLiftedIndexLabel(null), "");
  assert.equal(hourlyLiftedIndexLabel(Number.NaN), "");
  assert.equal(dailyPrecipMinLabel(12.4), "min 12%");
  assert.equal(dailyPrecipMinLabel(0), "min 0%");
  assert.equal(dailyPrecipMinLabel(null), "");
  assert.equal(dailyPrecipMinLabel(Number.NaN), "");
});

test("formats hourly soil moisture and daily peak dew point", () => {
  assert.equal(formatSoilMoisture(0.284), "28% moist");
  assert.equal(formatSoilMoisture(0), "0% moist");
  assert.equal(formatSoilMoisture(null), "—");
  assert.equal(hourlySoilMoistureLabel(0.284), "28% moist");
  assert.equal(hourlySoilMoistureLabel(0), "0% moist");
  assert.equal(hourlySoilMoistureLabel(-0.1), "");
  assert.equal(hourlySoilMoistureLabel(null), "");
  assert.equal(hourlySoilMoistureLabel(Number.NaN), "");
  assert.equal(dailyDewMaxLabel(18.6, "c"), "dew max 19°C");
  assert.equal(dailyDewMaxLabel(20, "f"), "dew max 68°F");
  assert.equal(dailyDewMaxLabel(null), "");
  assert.equal(dailyDewMaxLabel(Number.NaN), "");
});

test("formats hourly 1–3cm soil moisture and daily minimum dew point", () => {
  assert.equal(formatSoilMoisture13(0.316), "32% 1–3cm");
  assert.equal(formatSoilMoisture13(0), "0% 1–3cm");
  assert.equal(formatSoilMoisture13(null), "—");
  assert.equal(hourlySoilMoisture13Label(0.316), "32% 1–3cm");
  assert.equal(hourlySoilMoisture13Label(0), "0% 1–3cm");
  assert.equal(hourlySoilMoisture13Label(-0.1), "");
  assert.equal(hourlySoilMoisture13Label(null), "");
  assert.equal(hourlySoilMoisture13Label(Number.NaN), "");
  assert.equal(dailyDewMinLabel(8.4, "c"), "dew min 8°C");
  assert.equal(dailyDewMinLabel(20, "f"), "dew min 68°F");
  assert.equal(dailyDewMinLabel(null), "");
  assert.equal(dailyDewMinLabel(Number.NaN), "");
});

test("formats hourly 3–9cm soil moisture and daily minimum wet-bulb", () => {
  assert.equal(formatSoilMoisture39(0.348), "35% 3–9cm");
  assert.equal(formatSoilMoisture39(0), "0% 3–9cm");
  assert.equal(formatSoilMoisture39(null), "—");
  assert.equal(hourlySoilMoisture39Label(0.348), "35% 3–9cm");
  assert.equal(hourlySoilMoisture39Label(0), "0% 3–9cm");
  assert.equal(hourlySoilMoisture39Label(-0.1), "");
  assert.equal(hourlySoilMoisture39Label(null), "");
  assert.equal(hourlySoilMoisture39Label(Number.NaN), "");
  assert.equal(dailyWetBulbMinLabel(11.6, "c"), "wet min 12°C");
  assert.equal(dailyWetBulbMinLabel(20, "f"), "wet min 68°F");
  assert.equal(dailyWetBulbMinLabel(null), "");
  assert.equal(dailyWetBulbMinLabel(Number.NaN), "");
});

test("formats hourly 9–27cm soil moisture and daily mean wind", () => {
  assert.equal(formatSoilMoisture927(0.372), "37% 9–27cm");
  assert.equal(formatSoilMoisture927(0), "0% 9–27cm");
  assert.equal(formatSoilMoisture927(null), "—");
  assert.equal(hourlySoilMoisture927Label(0.372), "37% 9–27cm");
  assert.equal(hourlySoilMoisture927Label(0), "0% 9–27cm");
  assert.equal(hourlySoilMoisture927Label(-0.1), "");
  assert.equal(hourlySoilMoisture927Label(null), "");
  assert.equal(hourlySoilMoisture927Label(Number.NaN), "");
  assert.equal(dailyWindMeanLabel(14.4, "c"), "mean 14 km/h");
  assert.equal(dailyWindMeanLabel(16.0934, "f"), "mean 10 mph");
  assert.equal(dailyWindMeanLabel(null), "");
  assert.equal(dailyWindMeanLabel(Number.NaN), "");
});

test("formats hourly 27–81cm soil moisture and daily minimum CAPE", () => {
  assert.equal(formatSoilMoisture2781(0.396), "40% 27–81cm");
  assert.equal(formatSoilMoisture2781(0), "0% 27–81cm");
  assert.equal(formatSoilMoisture2781(null), "—");
  assert.equal(hourlySoilMoisture2781Label(0.396), "40% 27–81cm");
  assert.equal(hourlySoilMoisture2781Label(0), "0% 27–81cm");
  assert.equal(hourlySoilMoisture2781Label(-0.1), "");
  assert.equal(hourlySoilMoisture2781Label(null), "");
  assert.equal(hourlySoilMoisture2781Label(Number.NaN), "");
  assert.equal(dailyCapeMinLabel(80), "min CAPE 80 J/kg");
  assert.equal(dailyCapeMinLabel(0), "min CAPE 0 J/kg");
  assert.equal(dailyCapeMinLabel(null), "");
  assert.equal(dailyCapeMinLabel(Number.NaN), "");
});

test("formats hourly 6cm soil temperature and daily mean wet-bulb", () => {
  assert.equal(hourlySoilTemp6Label(14.6, "c"), "soil 6cm 15°C");
  assert.equal(hourlySoilTemp6Label(20, "f"), "soil 6cm 68°F");
  assert.equal(hourlySoilTemp6Label(null), "");
  assert.equal(hourlySoilTemp6Label(Number.NaN), "");
  assert.equal(dailyWetBulbMeanLabel(13.7, "c"), "wet mean 14°C");
  assert.equal(dailyWetBulbMeanLabel(20, "f"), "wet mean 68°F");
  assert.equal(dailyWetBulbMeanLabel(null), "");
  assert.equal(dailyWetBulbMeanLabel(Number.NaN), "");
});

test("labels today and tomorrow from forecast dates", () => {
  assert.equal(dateKey("2026-09-05T11:00"), "2026-09-05");
  assert.equal(nextDateKey("2026-09-05"), "2026-09-06");
  assert.equal(nextDateKey("2026-12-31"), "2027-01-01");
  assert.equal(forecastDayName("2026-09-05", "2026-09-05T11:00"), "Today");
  assert.equal(forecastDayName("2026-09-06", "2026-09-05T11:00"), "Tomorrow");
  const later = forecastDayName("2026-09-08", "2026-09-05T11:00");
  assert.notEqual(later, "Today");
  assert.notEqual(later, "Tomorrow");
  assert.ok(later.length > 0);
  assert.equal(forecastDayName("", "2026-09-05"), "");
});

test("formats daylight length from sunrise and sunset", () => {
  assert.equal(daylightMinutes("2026-09-05T06:42", "2026-09-05T19:15"), 12 * 60 + 33);
  assert.equal(formatDaylight("2026-09-05T06:42", "2026-09-05T19:15"), "12h 33m");
  assert.equal(formatDaylight("2026-09-05T06:00", "2026-09-05T18:00"), "12h");
  assert.equal(formatDaylight("2026-09-05T00:00", "2026-09-05T00:45"), "45m");
  assert.equal(formatDaylight(null, "2026-09-05T19:15"), "—");
  assert.equal(formatDaylight("2026-09-05T19:15", "2026-09-05T06:42"), "—");
  assert.equal(daylightMinutes("2026-09-05T12:00", "2026-09-05T12:00"), null);
});

test("labels humidity comfort", () => {
  assert.equal(humidityComfort(18), "Dry");
  assert.equal(humidityComfort(30), "Comfortable");
  assert.equal(humidityComfort(60), "Comfortable");
  assert.equal(humidityComfort(72), "Humid");
  assert.equal(humidityComfort(88), "Muggy");
  assert.equal(humidityComfort(null), "");
  assert.equal(formatHumidity(41.6), "42% Comfortable");
  assert.equal(formatHumidity(18), "18% Dry");
  assert.equal(formatHumidity(null), "—");
});

test("formats sunrise, sunset, and UV index", () => {
  assert.equal(formatSunTime("2026-09-05T06:42"), "6:42 AM");
  assert.equal(formatSunTime("2026-09-05T18:07:00"), "6:07 PM");
  assert.equal(formatSunTime("2026-09-05T00:05"), "12:05 AM");
  assert.equal(formatSunTime("2026-09-05T12:00"), "12:00 PM");
  assert.equal(formatSunTime(null), "—");
  assert.equal(formatSunRange("2026-09-05T06:42", "2026-09-05T19:15"), "6:42 AM – 7:15 PM");
  assert.equal(formatSunRange(null, null), "—");
  assert.equal(uvRisk(1.2), "Low");
  assert.equal(uvRisk(4), "Moderate");
  assert.equal(uvRisk(6.4), "High");
  assert.equal(uvRisk(9), "Very high");
  assert.equal(uvRisk(11), "Extreme");
  assert.equal(formatUv(6.4), "6 High");
  assert.equal(formatUv(null), "—");
});

test("detects night from sunrise and sunset", () => {
  assert.equal(clockMinutes("2026-09-05T06:42"), 6 * 60 + 42);
  assert.equal(clockMinutes("2026-09-05T18:07:00"), 18 * 60 + 7);
  assert.equal(clockMinutes(null), null);
  assert.equal(clockMinutes("not-a-time"), null);
  assert.equal(
    isNight("2026-09-05T05:00", "2026-09-05T06:42", "2026-09-05T19:15"),
    true,
  );
  assert.equal(
    isNight("2026-09-05T12:00", "2026-09-05T06:42", "2026-09-05T19:15"),
    false,
  );
  assert.equal(
    isNight("2026-09-05T19:15", "2026-09-05T06:42", "2026-09-05T19:15"),
    true,
  );
  assert.equal(
    isNight("2026-09-05T06:42", "2026-09-05T06:42", "2026-09-05T19:15"),
    false,
  );
  assert.equal(isNight("2026-09-05T22:00", null, "2026-09-05T19:15"), false);
  assert.equal(
    dailyIndexForTime(["2026-09-05", "2026-09-06"], "2026-09-06T01:00"),
    1,
  );
  assert.equal(dailyIndexForTime(["2026-09-05"], "2026-09-07T01:00"), -1);
  assert.equal(dailyIndexForTime(null, "2026-09-05T01:00"), -1);
});

test("formats US AQI with EPA-style labels", () => {
  assert.equal(aqiLabel(12), "Good");
  assert.equal(aqiLabel(50), "Good");
  assert.equal(aqiLabel(75), "Moderate");
  assert.equal(aqiLabel(140), "Unhealthy (sensitive)");
  assert.equal(aqiLabel(180), "Unhealthy");
  assert.equal(aqiLabel(250), "Very unhealthy");
  assert.equal(aqiLabel(320), "Hazardous");
  assert.equal(aqiLabel(null), "");
  assert.equal(formatAqi(42.4), "42 Good");
  assert.equal(formatAqi(null), "—");
});

test("formats pressure, PM2.5, and AQI detail", () => {
  assert.ok(Math.abs(hPaToInHg(1013.25) - 29.92) < 0.02);
  assert.equal(formatPressure(1013.2, "c"), "1013 hPa");
  assert.equal(formatPressure(1013.25, "f"), "29.92 inHg");
  assert.equal(formatPressure(null), "—");
  assert.equal(formatPm25(8.4), "8 µg/m³");
  assert.equal(formatPm25(null), "—");
  assert.equal(formatAqiDetail(42.4, 8.4), "42 Good · 8 µg/m³");
  assert.equal(formatAqiDetail(42.4, null), "42 Good");
  assert.equal(formatAqiDetail(null, 8.4), "—");
});

test("formats visibility in km or miles", () => {
  assert.equal(formatVisibility(10000, "c"), "10 km");
  assert.equal(formatVisibility(2400, "c"), "2.4 km");
  assert.equal(formatVisibility(500, "c"), "500 m");
  assert.equal(formatVisibility(16093.44, "f"), "10 mi");
  assert.equal(formatVisibility(1609.344, "f"), "1 mi");
  assert.equal(formatVisibility(null), "—");
  assert.equal(formatVisibility(-1), "—");
});

test("pairs daily rain chance with precip totals", () => {
  assert.deepEqual(dailyPrecipParts(41.6, 2.4, "c"), { chance: "42%", amount: "2.4 mm" });
  assert.deepEqual(dailyPrecipParts(10, 25.4, "f"), { chance: "10%", amount: "1 in" });
  assert.deepEqual(dailyPrecipParts(20, 0, "c"), { chance: "20%", amount: "" });
  assert.deepEqual(dailyPrecipParts(null, null, "c"), { chance: "", amount: "" });
  assert.deepEqual(dailyPrecipParts(null, 3, "c"), { chance: "", amount: "3 mm" });
});

test("formats snowfall amounts", () => {
  assert.ok(Math.abs(cmToIn(2.54) - 1) < 1e-9);
  assert.equal(formatSnowfall(0, "c"), "0 cm");
  assert.equal(formatSnowfall(2.4, "c"), "2.4 cm");
  assert.equal(formatSnowfall(2.54, "f"), "1 in");
  assert.equal(formatSnowfall(null), "—");
  assert.equal(dailySnowAmount(0, "c"), "");
  assert.equal(dailySnowAmount(2.4, "c"), "2.4 cm");
  assert.equal(dailySnowAmount(2.54, "f"), "1 in");
  assert.equal(dailySnowAmount(null), "");
});

test("formats forecast times in the place timezone", () => {
  assert.equal(parseIsoParts("2026-09-05T18:07:00").hour, 18);
  assert.equal(parseIsoParts("2026-09-05").hasTime, false);
  assert.equal(parseIsoParts("nope"), null);
  assert.equal(formatHourLabel("2026-09-05T00:00"), "12 AM");
  assert.equal(formatHourLabel("2026-09-05T11:00"), "11 AM");
  assert.equal(formatHourLabel("2026-09-05T12:00"), "12 PM");
  assert.equal(formatHourLabel("2026-09-05T18:07"), "6 PM");
  assert.equal(formatHourLabel(null), "—");
  assert.equal(
    formatUpdatedAt("2026-09-05T11:00"),
    "Updated Sat, Sep 5, 11:00 AM",
  );
  assert.equal(formatUpdatedAt("2026-09-05"), "");
});

test("tracks recent places without duplicates", () => {
  const sf = {
    name: "San Francisco",
    admin1: "California",
    country: "United States",
    latitude: 37.7749,
    longitude: -122.4194,
  };
  const porto = {
    name: "Porto Alegre",
    admin1: "Rio Grande do Sul",
    country: "Brazil",
    latitude: -30.03,
    longitude: -51.23,
  };
  assert.equal(placeKey(sf), "37.775,-122.419");
  assert.equal(placeKey({ latitude: "nope", longitude: 1 }), "");
  assert.deepEqual(parseRecents(null), []);
  assert.deepEqual(parseRecents("not-json"), []);
  assert.deepEqual(parseRecents('{"name":"x"}'), []);
  assert.deepEqual(parseRecents(JSON.stringify([sf, { name: "bad" }])), [sf]);

  const first = rememberRecent([], sf);
  assert.equal(first.length, 1);
  assert.equal(first[0].name, "San Francisco");

  const moved = rememberRecent(first, {
    ...sf,
    name: "SF",
    latitude: 37.7751,
    longitude: -122.4192,
  });
  assert.equal(moved.length, 1);
  assert.equal(moved[0].name, "SF");

  const two = rememberRecent(moved, porto);
  assert.equal(two[0].name, "Porto Alegre");
  assert.equal(two[1].name, "SF");
  assert.deepEqual(rememberRecent(two, { name: "Nowhere" }), two);

  const overflow = [];
  for (let i = 0; i < MAX_RECENTS + 2; i += 1) {
    overflow.push(
      rememberRecent(overflow.at(-1) ?? [], {
        name: `City ${i}`,
        latitude: i,
        longitude: i,
      }),
    );
  }
  assert.equal(overflow.at(-1).length, MAX_RECENTS);
  assert.equal(overflow.at(-1)[0].name, `City ${MAX_RECENTS + 1}`);
});

test("formats cloud cover", () => {
  assert.equal(cloudCoverLabel(5), "Clear");
  assert.equal(cloudCoverLabel(25), "Mostly clear");
  assert.equal(cloudCoverLabel(50), "Partly cloudy");
  assert.equal(cloudCoverLabel(80), "Mostly cloudy");
  assert.equal(cloudCoverLabel(95), "Overcast");
  assert.equal(formatCloud(48), "48% Partly cloudy");
  assert.equal(formatCloud(null), "—");
});

test("omits gusts that are not stronger than sustained wind", () => {
  assert.equal(formatWind(16, "c", 180, 16), "16 km/h S");
  assert.equal(formatWind(16, "c", 180, 28), "16 km/h S · gusts 28 km/h");
  assert.equal(formatWind(16, "f", null, 32), "10 mph · gusts 20 mph");
});

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
  parseIsoParts,
  formatHourLabel,
  formatUpdatedAt,
  placeKey,
  parseRecents,
  rememberRecent,
  MAX_RECENTS,
  forecastUrl,
  geocodeUrl,
} from "../app.js";

test("describeWeather maps WMO codes and night icons", () => {
  assert.equal(describeWeather(0).icon, "☀️");
  assert.equal(describeWeather(0, true).icon, "🌙");
  assert.equal(describeWeather(63).label, "Rain");
  assert.equal(describeWeather(999).label, "Unknown conditions");
});

test("formatTemp converts and rounds", () => {
  assert.equal(formatTemp(20, "c"), "20°C");
  assert.equal(formatTemp(20, "f"), "68°F");
  assert.equal(cToF(0), 32);
  assert.equal(Math.round(kmhToMph(16)), 10);
});

test("placeLabel joins available parts", () => {
  assert.equal(
    placeLabel({ name: "Porto Alegre", admin1: "Rio Grande do Sul", country: "Brazil" }),
    "Porto Alegre, Rio Grande do Sul, Brazil",
  );
  assert.equal(placeLabel({ name: "Oslo", country: "Norway" }), "Oslo, Norway");
});

test("formatWind includes direction and gusts", () => {
  assert.equal(formatWindDir(0), "N");
  assert.equal(formatWindDir(90), "E");
  assert.equal(formatWind(20, "c", 180), "20 km/h S");
  assert.equal(formatWind(16, "f", 0, 32), "10 mph N · gusts 20 mph");
  assert.equal(formatWind(20, "c", 180, 18), "20 km/h S");
});

test("formatPrecip and formatChance handle units and empty values", () => {
  assert.equal(formatPrecip(0, "c"), "0 mm");
  assert.equal(formatPrecip(2.46, "c"), "2.5 mm");
  assert.equal(formatPrecip(25.4, "f"), "1 in");
  assert.equal(formatPrecip(null), "—");
  assert.equal(formatChance(41.2), "41%");
  assert.equal(formatChance(undefined), "");
  assert.equal(Math.round(mmToIn(25.4) * 100) / 100, 1);
});

test("dailyPrecipParts hides a zero total", () => {
  assert.deepEqual(dailyPrecipParts(40, 0, "c"), { chance: "40%", amount: "" });
  assert.deepEqual(dailyPrecipParts(80, 3.2, "c"), { chance: "80%", amount: "3.2 mm" });
});

test("place helpers cover geolocation and reverse geocode", () => {
  assert.equal(formatCoords(-30.03, -51.23), "30.03°S, 51.23°W");
  const geo = placeFromGeolocation(37.77, -122.42);
  assert.equal(geo.name, "Your location");
  assert.equal(placeKey(geo), "37.770,-122.420");
  const named = placeFromReverse(
    { city: "Austin", principalSubdivision: "Texas", countryName: "United States", latitude: 30.27, longitude: -97.74 },
  );
  assert.equal(named.name, "Austin");
  assert.equal(named.admin1, "Texas");
  const fallback = placeFromReverse({}, { latitude: 1, longitude: 2 });
  assert.equal(fallback.name, "Your location");
});

test("recents keep the newest unique place first", () => {
  const a = { name: "A", latitude: 1, longitude: 1 };
  const b = { name: "B", latitude: 2, longitude: 2 };
  const againA = { name: "A-new", latitude: 1, longitude: 1 };
  const recents = rememberRecent(rememberRecent([], a), b);
  assert.equal(recents[0].name, "B");
  assert.equal(rememberRecent(recents, againA)[0].name, "A-new");
  assert.equal(rememberRecent(recents, againA).length, 2);
  assert.equal(MAX_RECENTS, 5);
  assert.deepEqual(parseRecents("not-json"), []);
  assert.deepEqual(parseRecents('[{"name":"x"}]'), []);
});

test("nextHours returns upcoming slots only", () => {
  const hourly = {
    time: ["2026-09-06T10:00", "2026-09-06T11:00", "2026-09-06T12:00"],
    temperature_2m: [18, 19, 20],
    weather_code: [0, 1, 2],
    precipitation_probability: [0, 10, 20],
    precipitation: [0, 0, 0.2],
  };
  const hours = nextHours(hourly, Date.parse("2026-09-06T11:00:00"), 2);
  assert.equal(hours.length, 2);
  assert.equal(hours[0].temp, 19);
  assert.equal(hours[1].amount, 0.2);
  assert.deepEqual(nextHours({}, 0), []);
});

test("forecast day names use Today and Tomorrow", () => {
  assert.equal(dateKey("2026-09-06T15:00"), "2026-09-06");
  assert.equal(nextDateKey("2026-09-06"), "2026-09-07");
  assert.equal(forecastDayName("2026-09-06", "2026-09-06T08:00"), "Today");
  assert.equal(forecastDayName("2026-09-07", "2026-09-06T08:00"), "Tomorrow");
  assert.match(forecastDayName("2026-09-08", "2026-09-06T08:00"), /Sep/);
});

test("place-timezone clock labels do not use the browser zone", () => {
  assert.equal(formatHourLabel("2026-09-06T00:00"), "12 AM");
  assert.equal(formatHourLabel("2026-09-06T13:00"), "1 PM");
  assert.equal(formatSunTime("2026-09-06T06:42"), "6:42 AM");
  assert.equal(formatSunRange("2026-09-06T06:42", "2026-09-06T18:05"), "6:42 AM – 6:05 PM");
  assert.equal(formatUpdatedAt("2026-09-06T15:30"), "Updated Sun, Sep 6, 3:30 PM");
  assert.equal(parseIsoParts("nope"), null);
  assert.equal(clockMinutes("2026-09-06T07:15"), 7 * 60 + 15);
});

test("isNight compares clock times in the place timezone", () => {
  assert.equal(isNight("2026-09-06T05:00", "2026-09-06T06:30", "2026-09-06T18:00"), true);
  assert.equal(isNight("2026-09-06T12:00", "2026-09-06T06:30", "2026-09-06T18:00"), false);
  assert.equal(isNight("2026-09-06T20:00", "2026-09-06T06:30", "2026-09-06T18:00"), true);
  assert.equal(dailyIndexForTime(["2026-09-06", "2026-09-07"], "2026-09-07T03:00"), 1);
});

test("humidity, UV, AQI, pressure, and visibility formatters", () => {
  assert.equal(humidityComfort(20), "Dry");
  assert.equal(formatHumidity(55), "55% Comfortable");
  assert.equal(uvRisk(9), "Very high");
  assert.equal(formatUv(3), "3 Moderate");
  assert.equal(aqiLabel(42), "Good");
  assert.equal(formatAqi(120), "120 Unhealthy (sensitive)");
  assert.equal(formatPm25(11.4), "11 µg/m³");
  assert.equal(formatAqiDetail(40, 8), "40 Good · 8 µg/m³");
  assert.equal(formatPressure(1013, "c"), "1013 hPa");
  assert.equal(formatPressure(1013.25, "f"), `${(Math.round(hPaToInHg(1013.25) * 100) / 100).toFixed(2)} inHg`);
  assert.equal(formatVisibility(12000, "c"), "12 km");
  assert.equal(formatVisibility(1609.344, "f"), "1 mi");
});

test("API URL builders request the fields the UI shows", () => {
  const forecast = forecastUrl(37.77, -122.42);
  assert.equal(forecast.origin, "https://api.open-meteo.com");
  assert.match(forecast.search, /current=.*temperature_2m/);
  assert.match(forecast.search, /hourly=.*precipitation_probability/);
  assert.match(forecast.search, /daily=.*temperature_2m_max/);
  assert.doesNotMatch(forecast.search, /soil_moisture/);
  const geo = geocodeUrl("Lisbon");
  assert.equal(geo.searchParams.get("name"), "Lisbon");
  assert.equal(geo.searchParams.get("count"), "6");
});

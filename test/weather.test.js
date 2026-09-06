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
  isWetCode,
  hourLooksWet,
  nextPrecip,
  formatNextPrecip,
  dateKey,
  nextDateKey,
  forecastDayName,
  formatSunTime,
  formatSunRange,
  humidityComfort,
  formatHumidity,
  dewPointComfort,
  formatDewPoint,
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
  cloudCoverLabel,
  formatCloudCover,
  dailyPrecipParts,
  parseIsoParts,
  formatHourLabel,
  formatUpdatedAt,
  placeKey,
  parseRecents,
  rememberRecent,
  parsePlaceFromSearch,
  placeToSearch,
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

test("next precip summarizes current rain or the next wet hour", () => {
  assert.equal(isWetCode(61), true);
  assert.equal(isWetCode(0), false);
  assert.equal(hourLooksWet({ amount: 0.2, precip: 10, code: 1 }), true);
  assert.equal(hourLooksWet({ amount: 0, precip: 40, code: 2 }), true);
  assert.equal(hourLooksWet({ amount: 0, precip: 10, code: 1 }), false);
  assert.deepEqual(nextPrecip([], { amount: 0.4, code: 0 }), { kind: "now" });
  assert.deepEqual(nextPrecip([], { amount: 0, code: 61 }), { kind: "now" });
  assert.deepEqual(nextPrecip([], { amount: 0, code: 0 }), { kind: "none" });
  const later = nextPrecip([
    { time: "2026-09-06T13:00", precip: 10, amount: 0, code: 1 },
    { time: "2026-09-06T15:00", precip: 70, amount: 0, code: 3 },
  ]);
  assert.equal(later.kind, "later");
  assert.equal(later.time, "2026-09-06T15:00");
  assert.equal(later.chance, 70);
  assert.equal(formatNextPrecip({ kind: "now" }), "Falling now");
  assert.equal(formatNextPrecip({ kind: "none" }), "None expected");
  assert.equal(formatNextPrecip({ kind: "later", time: "2026-09-06T15:00", chance: 70 }), "3 PM (70%)");
  assert.equal(formatNextPrecip({ kind: "later", time: "2026-09-06T09:00" }), "9 AM");
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
  assert.equal(dewPointComfort(8), "Dry");
  assert.equal(dewPointComfort(14), "Comfortable");
  assert.equal(dewPointComfort(22), "Muggy");
  assert.equal(dewPointComfort(25), "Oppressive");
  assert.equal(formatDewPoint(12, "c"), "12°C Comfortable");
  assert.equal(formatDewPoint(10, "f"), "50°F Comfortable");
  assert.equal(formatDewPoint(null), "—");
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
  assert.equal(cloudCoverLabel(4), "Clear");
  assert.equal(cloudCoverLabel(32), "Partly cloudy");
  assert.equal(cloudCoverLabel(70), "Mostly cloudy");
  assert.equal(cloudCoverLabel(95), "Overcast");
  assert.equal(formatCloudCover(42), "42% Partly cloudy");
  assert.equal(formatCloudCover(null), "—");
});

test("API URL builders request the fields the UI shows", () => {
  const forecast = forecastUrl(37.77, -122.42);
  assert.equal(forecast.origin, "https://api.open-meteo.com");
  assert.match(forecast.search, /current=.*temperature_2m/);
  assert.match(forecast.search, /current=.*dew_point_2m/);
  assert.match(forecast.search, /current=.*pressure_msl/);
  assert.match(forecast.search, /current=.*visibility/);
  assert.match(forecast.search, /current=.*cloud_cover/);
  assert.match(forecast.search, /hourly=.*precipitation_probability/);
  assert.match(forecast.search, /daily=.*temperature_2m_max/);
  assert.doesNotMatch(forecast.search, /soil_moisture/);
  const geo = geocodeUrl("Lisbon");
  assert.equal(geo.searchParams.get("name"), "Lisbon");
  assert.equal(geo.searchParams.get("count"), "6");
});

test("parses and builds shareable forecast URLs", () => {
  const sf = {
    name: "San Francisco",
    admin1: "California",
    country: "United States",
    latitude: 37.7749,
    longitude: -122.4194,
  };
  const search = placeToSearch(sf);
  assert.match(search, /^\?lat=37\.7749&lon=-122\.4194/);
  assert.match(search, /name=San\+Francisco/);
  assert.equal(placeToSearch({ name: "Nowhere" }), "");
  assert.equal(parsePlaceFromSearch(""), null);
  assert.equal(parsePlaceFromSearch("?foo=bar"), null);
  assert.deepEqual(parsePlaceFromSearch("?q=Porto+Alegre"), {
    kind: "query",
    query: "Porto Alegre",
  });
  assert.deepEqual(parsePlaceFromSearch(search), {
    kind: "place",
    place: sf,
  });
  assert.deepEqual(parsePlaceFromSearch("lat=1&lon=2"), {
    kind: "place",
    place: { name: "Shared location", latitude: 1, longitude: 2 },
  });
});

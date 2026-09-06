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

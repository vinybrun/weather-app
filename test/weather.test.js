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
} from "../app.js";

test("maps known WMO codes", () => {
  assert.equal(describeWeather(0).label, "Clear sky");
  assert.equal(describeWeather(95).icon, "⛈️");
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
  };
  const now = Date.parse("2026-09-05T11:00:00");
  const hours = nextHours(hourly, now, 2);
  assert.equal(hours.length, 2);
  assert.equal(hours[0].time, "2026-09-05T11:00");
  assert.equal(hours[0].temp, 19);
  assert.equal(hours[1].precip, 20);
  assert.deepEqual(nextHours(null, now), []);
});

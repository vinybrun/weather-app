import test from "node:test";
import assert from "node:assert/strict";
import { describeWeather, cToF, formatTemp, placeLabel } from "../app.js";

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

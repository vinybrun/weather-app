const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const STORAGE_KEY = "weather-app:last-place";
const UNIT_KEY = "weather-app:unit";

const WMO = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Dense freezing drizzle", icon: "🌧️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Heavy freezing rain", icon: "🌧️" },
  71: { label: "Slight snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Violent rain showers", icon: "🌧️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with hail", icon: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", icon: "⛈️" },
};

const WMO_NIGHT = {
  0: { label: "Clear sky", icon: "🌙" },
  1: { label: "Mainly clear", icon: "🌙" },
  2: { label: "Partly cloudy", icon: "☁️" },
};

export function describeWeather(code, night = false) {
  if (night && WMO_NIGHT[code]) return WMO_NIGHT[code];
  return WMO[code] ?? { label: "Unknown conditions", icon: "🌡️" };
}

export function cToF(c) {
  return (c * 9) / 5 + 32;
}

export function formatTemp(celsius, unit) {
  const value = unit === "f" ? cToF(celsius) : celsius;
  return `${Math.round(value)}°${unit === "f" ? "F" : "C"}`;
}

export function placeLabel(place) {
  return [place.name, place.admin1, place.country]
    .filter(Boolean)
    .join(", ");
}

export function kmhToMph(kmh) {
  return kmh * 0.621371;
}

export function formatWindDir(degrees) {
  if (degrees == null || Number.isNaN(Number(degrees))) return "";
  const dirs = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const heading = ((Number(degrees) % 360) + 360) % 360;
  return dirs[Math.round(heading / 22.5) % 16];
}

export function formatWind(kmh, unit, degrees) {
  const speed =
    unit === "f"
      ? `${Math.round(kmhToMph(kmh))} mph`
      : `${Math.round(kmh)} km/h`;
  const dir = formatWindDir(degrees);
  return dir ? `${speed} ${dir}` : speed;
}

export function mmToIn(mm) {
  return mm / 25.4;
}

export function formatPrecip(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "—";
  if (unit === "f") {
    const inches = mmToIn(Number(mm));
    if (inches === 0) return "0 in";
    return `${Math.round(inches * 100) / 100} in`;
  }
  if (Number(mm) === 0) return "0 mm";
  return `${Math.round(Number(mm) * 10) / 10} mm`;
}

export function formatChance(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  return `${Math.round(Number(percent))}%`;
}

export function formatCoords(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

export function placeFromGeolocation(lat, lon) {
  return {
    name: "Your location",
    admin1: formatCoords(lat, lon),
    latitude: lat,
    longitude: lon,
  };
}

export function placeFromReverse(geo, coords = {}) {
  const latitude = Number(geo?.latitude ?? coords.latitude);
  const longitude = Number(geo?.longitude ?? coords.longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return placeFromGeolocation(latitude, longitude);
  }
  const name = geo?.city || geo?.locality || geo?.principalSubdivision;
  if (!name) {
    return placeFromGeolocation(latitude, longitude);
  }
  return {
    name,
    admin1:
      geo.principalSubdivision && geo.principalSubdivision !== name
        ? geo.principalSubdivision
        : undefined,
    country: geo.countryName || undefined,
    latitude,
    longitude,
  };
}

export function nextHours(hourly, nowMs, count = 12) {
  const hours = [];
  if (!hourly?.time) return hours;
  for (let i = 0; i < hourly.time.length && hours.length < count; i += 1) {
    const t = new Date(hourly.time[i]).getTime();
    if (t >= nowMs) {
      hours.push({
        time: hourly.time[i],
        temp: hourly.temperature_2m[i],
        code: hourly.weather_code[i],
        precip: hourly.precipitation_probability?.[i],
      });
    }
  }
  return hours;
}

export function dateKey(iso) {
  if (!iso) return "";
  const match = String(iso).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

export function nextDateKey(isoDate) {
  const key = dateKey(isoDate);
  if (!key) return "";
  const [year, month, day] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

export function forecastDayName(dayIso, todayIso) {
  const day = dateKey(dayIso);
  const today = dateKey(todayIso);
  if (!day) return "";
  if (today && day === today) return "Today";
  if (today && day === nextDateKey(today)) return "Tomorrow";
  return new Date(`${day}T12:00:00`).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatSunTime(iso) {
  if (!iso || typeof iso !== "string") return "—";
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return "—";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return "—";
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatSunRange(sunrise, sunset) {
  const rise = formatSunTime(sunrise);
  const set = formatSunTime(sunset);
  if (rise === "—" && set === "—") return "—";
  return `${rise} – ${set}`;
}

export function uvRisk(uv) {
  if (uv == null || Number.isNaN(Number(uv))) return "";
  const n = Number(uv);
  if (n >= 11) return "Extreme";
  if (n >= 8) return "Very high";
  if (n >= 6) return "High";
  if (n >= 3) return "Moderate";
  return "Low";
}

export function formatUv(uv) {
  if (uv == null || Number.isNaN(Number(uv))) return "—";
  const risk = uvRisk(uv);
  return `${Math.round(Number(uv))} ${risk}`;
}

export function clockMinutes(iso) {
  if (!iso || typeof iso !== "string") return null;
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function isNight(timeIso, sunriseIso, sunsetIso) {
  const time = clockMinutes(timeIso);
  const rise = clockMinutes(sunriseIso);
  const set = clockMinutes(sunsetIso);
  if (time == null || rise == null || set == null) return false;
  return time < rise || time >= set;
}

export function dailyIndexForTime(dailyTimes, iso) {
  const key = dateKey(iso);
  if (!key || !Array.isArray(dailyTimes)) return -1;
  return dailyTimes.findIndex((day) => dateKey(day) === key);
}

export function aqiLabel(aqi) {
  if (aqi == null || Number.isNaN(Number(aqi))) return "";
  const n = Number(aqi);
  if (n <= 50) return "Good";
  if (n <= 100) return "Moderate";
  if (n <= 150) return "Unhealthy (sensitive)";
  if (n <= 200) return "Unhealthy";
  if (n <= 300) return "Very unhealthy";
  return "Hazardous";
}

export function formatAqi(aqi) {
  if (aqi == null || Number.isNaN(Number(aqi))) return "—";
  return `${Math.round(Number(aqi))} ${aqiLabel(aqi)}`;
}

const isBrowser = typeof document !== "undefined";

const els = isBrowser
  ? {
      form: document.getElementById("search-form"),
      input: document.getElementById("city-input"),
      suggestions: document.getElementById("suggestions"),
      locate: document.getElementById("locate-btn"),
      status: document.getElementById("status"),
      current: document.getElementById("current"),
      hourlyWrap: document.getElementById("hourly-wrap"),
      dailyWrap: document.getElementById("daily-wrap"),
      place: document.getElementById("place"),
      updated: document.getElementById("updated"),
      icon: document.getElementById("icon"),
      temp: document.getElementById("temp"),
      summary: document.getElementById("summary"),
      feels: document.getElementById("feels"),
      humidity: document.getElementById("humidity"),
      wind: document.getElementById("wind"),
      hiLo: document.getElementById("hi-lo"),
      precip: document.getElementById("precip"),
      sun: document.getElementById("sun"),
      uv: document.getElementById("uv"),
      aqi: document.getElementById("aqi"),
      hourly: document.getElementById("hourly"),
      daily: document.getElementById("daily"),
      unitC: document.getElementById("unit-c"),
      unitF: document.getElementById("unit-f"),
    }
  : {};

const state = {
  unit:
    isBrowser && typeof localStorage !== "undefined" && localStorage.getItem(UNIT_KEY) === "f"
      ? "f"
      : "c",
  place: null,
  forecast: null,
  air: null,
  suggestTimer: null,
  highlightIndex: -1,
};

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("is-error", isError);
}

function setUnit(unit) {
  state.unit = unit;
  localStorage.setItem(UNIT_KEY, unit);
  els.unitC.classList.toggle("is-active", unit === "c");
  els.unitF.classList.toggle("is-active", unit === "f");
  els.unitC.setAttribute("aria-pressed", String(unit === "c"));
  els.unitF.setAttribute("aria-pressed", String(unit === "f"));
  if (state.place && state.forecast) render();
}

async function searchPlaces(name) {
  const url = new URL(GEO_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  return data.results ?? [];
}

async function reverseGeocode(lat, lon) {
  const url = new URL(REVERSE_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("localityLanguage", "en");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
  return res.json();
}

async function fetchForecast(lat, lon) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation",
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code,precipitation_probability");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max",
  );
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast failed (${res.status})`);
  return res.json();
}

async function fetchAirQuality(lat, lon) {
  const url = new URL(AIR_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("current", "us_aqi,pm2_5");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Air quality failed (${res.status})`);
  return res.json();
}

function suggestionButtons() {
  return [...els.suggestions.querySelectorAll("button")];
}

function hideSuggestions() {
  els.suggestions.hidden = true;
  els.suggestions.innerHTML = "";
  els.input.setAttribute("aria-expanded", "false");
  els.input.removeAttribute("aria-activedescendant");
  state.highlightIndex = -1;
}

function highlightSuggestion(index) {
  const items = suggestionButtons();
  if (!items.length) return;
  const next = ((index % items.length) + items.length) % items.length;
  items.forEach((btn, i) => {
    const selected = i === next;
    btn.setAttribute("aria-selected", String(selected));
    if (selected) btn.id = "suggestion-active";
    else btn.removeAttribute("id");
  });
  state.highlightIndex = next;
  els.input.setAttribute("aria-activedescendant", "suggestion-active");
}

function chooseSuggestion(place) {
  hideSuggestions();
  els.input.value = place.name;
  loadPlace(place);
}

function showSuggestions(places) {
  els.suggestions.innerHTML = "";
  state.highlightIndex = -1;
  if (!places.length) {
    hideSuggestions();
    return;
  }
  for (const place of places) {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = placeLabel(place);
    btn.setAttribute("aria-selected", "false");
    btn.addEventListener("click", () => chooseSuggestion(place));
    li.append(btn);
    els.suggestions.append(li);
  }
  els.suggestions.hidden = false;
  els.input.setAttribute("aria-expanded", "true");
}

async function loadPlace(place) {
  setStatus(`Loading weather for ${placeLabel(place)}…`);
  try {
    const [forecast, air] = await Promise.all([
      fetchForecast(place.latitude, place.longitude),
      fetchAirQuality(place.latitude, place.longitude).catch(() => null),
    ]);
    state.place = place;
    state.forecast = forecast;
    state.air = air;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
    render();
    setStatus("");
  } catch (err) {
    setStatus(err.message || "Could not load weather.", true);
  }
}

function render() {
  const { place, forecast, air, unit } = state;
  const current = forecast.current;
  const nightNow = isNight(
    current.time,
    forecast.daily.sunrise?.[0],
    forecast.daily.sunset?.[0],
  );
  const wx = describeWeather(current.weather_code, nightNow);
  els.place.textContent = placeLabel(place);
  els.updated.textContent = `Updated ${new Date(current.time).toLocaleString()}`;
  els.icon.textContent = wx.icon;
  els.temp.textContent = formatTemp(current.temperature_2m, unit);
  els.summary.textContent = wx.label;
  els.feels.textContent = formatTemp(current.apparent_temperature, unit);
  els.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  els.wind.textContent = formatWind(
    current.wind_speed_10m,
    unit,
    current.wind_direction_10m,
  );
  els.hiLo.textContent = `${formatTemp(forecast.daily.temperature_2m_max[0], unit)} / ${formatTemp(forecast.daily.temperature_2m_min[0], unit)}`;
  if (els.precip) els.precip.textContent = formatPrecip(current.precipitation, unit);
  if (els.sun) {
    els.sun.textContent = formatSunRange(
      forecast.daily.sunrise?.[0],
      forecast.daily.sunset?.[0],
    );
  }
  if (els.uv) els.uv.textContent = formatUv(forecast.daily.uv_index_max?.[0]);
  if (els.aqi) els.aqi.textContent = formatAqi(air?.current?.us_aqi);
  els.current.hidden = false;

  const now = new Date(current.time).getTime();
  const hours = nextHours(forecast.hourly, now, 12);
  els.hourly.innerHTML = hours
    .map((h) => {
      const dayIdx = dailyIndexForTime(forecast.daily.time, h.time);
      const night = isNight(
        h.time,
        forecast.daily.sunrise?.[dayIdx],
        forecast.daily.sunset?.[dayIdx],
      );
      const d = describeWeather(h.code, night);
      const label = new Date(h.time).toLocaleTimeString([], {
        hour: "numeric",
      });
      const chance = formatChance(h.precip);
      const chanceHtml = chance ? `<div class="p">${chance}</div>` : "";
      return `<li><div class="t">${label}</div><div class="i">${d.icon}</div><div>${formatTemp(h.temp, unit)}</div>${chanceHtml}</li>`;
    })
    .join("");
  els.hourlyWrap.hidden = hours.length === 0;

  els.daily.innerHTML = forecast.daily.time
    .map((day, i) => {
      const d = describeWeather(forecast.daily.weather_code[i]);
      const name = forecastDayName(day, forecast.current.time);
      const chance = formatChance(forecast.daily.precipitation_probability_max?.[i]);
      return `<li>
        <span>${name}</span>
        <span class="i">${d.icon}</span>
        <span class="chance"${chance ? ' title="Chance of precipitation"' : ""}>${chance}</span>
        <span class="hi">${formatTemp(forecast.daily.temperature_2m_max[i], unit)}</span>
        <span class="lo">${formatTemp(forecast.daily.temperature_2m_min[i], unit)}</span>
      </li>`;
    })
    .join("");
  els.dailyWrap.hidden = false;
}

async function onSearch(query) {
  const name = query.trim();
  if (!name) {
    setStatus("Enter a city name.", true);
    return;
  }
  setStatus("Searching…");
  hideSuggestions();
  try {
    const places = await searchPlaces(name);
    if (!places.length) {
      setStatus(`No places found for “${name}”.`, true);
      return;
    }
    await loadPlace(places[0]);
  } catch (err) {
    setStatus(err.message || "Search failed.", true);
  }
}

function useGeolocation() {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not available in this browser.", true);
    return;
  }
  setStatus("Finding your location…");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const geo = await reverseGeocode(latitude, longitude);
        await loadPlace(placeFromReverse(geo, { latitude, longitude }));
      } catch {
        await loadPlace(placeFromGeolocation(latitude, longitude));
      }
    },
    () => setStatus("Could not get your location. Search for a city instead.", true),
    { timeout: 10000 },
  );
}

function bind() {
  if (!els.form) return;

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const items = suggestionButtons();
    if (state.highlightIndex >= 0 && items[state.highlightIndex]) {
      items[state.highlightIndex].click();
      return;
    }
    onSearch(els.input.value);
  });

  els.input.addEventListener("keydown", (event) => {
    const items = suggestionButtons();
    if (event.key === "Escape") {
      hideSuggestions();
      return;
    }
    if (!items.length || els.suggestions.hidden) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      highlightSuggestion(state.highlightIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      highlightSuggestion(state.highlightIndex < 0 ? items.length - 1 : state.highlightIndex - 1);
    }
  });

  els.input.addEventListener("input", () => {
    const q = els.input.value.trim();
    clearTimeout(state.suggestTimer);
    if (q.length < 2) {
      hideSuggestions();
      return;
    }
    state.suggestTimer = setTimeout(async () => {
      try {
        const places = await searchPlaces(q);
        showSuggestions(places);
      } catch {
        hideSuggestions();
      }
    }, 220);
  });

  document.addEventListener("click", (event) => {
    if (!els.suggestions.contains(event.target) && event.target !== els.input) {
      hideSuggestions();
    }
  });

  els.locate.addEventListener("click", useGeolocation);
  els.unitC.addEventListener("click", () => setUnit("c"));
  els.unitF.addEventListener("click", () => setUnit("f"));
  setUnit(state.unit);

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      loadPlace(JSON.parse(saved));
      return;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  onSearch("San Francisco");
}

if (isBrowser) {
  bind();
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const STORAGE_KEY = "weather-app:last-place";
const UNIT_KEY = "weather-app:unit";
export const RECENTS_KEY = "weather-app:recents";
export const MAX_RECENTS = 5;

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

export function formatWind(kmh, unit, degrees, gustKmh) {
  const speed =
    unit === "f"
      ? `${Math.round(kmhToMph(kmh))} mph`
      : `${Math.round(kmh)} km/h`;
  const dir = formatWindDir(degrees);
  let text = dir ? `${speed} ${dir}` : speed;
  if (
    gustKmh != null &&
    !Number.isNaN(Number(gustKmh)) &&
    Number(gustKmh) > Number(kmh)
  ) {
    const gust =
      unit === "f"
        ? `${Math.round(kmhToMph(gustKmh))} mph`
        : `${Math.round(Number(gustKmh))} km/h`;
    text = `${text} · gusts ${gust}`;
  }
  return text;
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

export function placeKey(place) {
  const lat = Number(place?.latitude);
  const lon = Number(place?.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return "";
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

export function parseRecents(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((place) => placeKey(place));
  } catch {
    return [];
  }
}

export function rememberRecent(recents, place, max = MAX_RECENTS) {
  const key = placeKey(place);
  if (!key) return [...(recents ?? [])];
  const next = [
    {
      name: place.name,
      admin1: place.admin1,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
    },
    ...(recents ?? []).filter((item) => placeKey(item) !== key),
  ];
  return next.slice(0, Math.max(0, max));
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
        feels: hourly.apparent_temperature?.[i],
        code: hourly.weather_code[i],
        precip: hourly.precipitation_probability?.[i],
        amount: hourly.precipitation?.[i],
        wind: hourly.wind_speed_10m?.[i],
        dir: hourly.wind_direction_10m?.[i],
        humidity: hourly.relative_humidity_2m?.[i],
        uv: hourly.uv_index?.[i],
        cloud: hourly.cloud_cover?.[i],
        visibility: hourly.visibility?.[i],
        dew: hourly.dew_point_2m?.[i],
        pressure: hourly.pressure_msl?.[i],
        gust: hourly.wind_gusts_10m?.[i],
        wet: hourly.wet_bulb_temperature_2m?.[i],
        snow: hourly.snowfall?.[i],
        showers: hourly.showers?.[i],
        rain: hourly.rain?.[i],
        depth: hourly.snow_depth?.[i],
        cape: hourly.cape?.[i],
        vpd: hourly.vapour_pressure_deficit?.[i],
        shine: hourly.sunshine_duration?.[i],
        sw: hourly.shortwave_radiation?.[i],
        et0: hourly.et0_fao_evapotranspiration?.[i],
        et: hourly.evapotranspiration?.[i],
        fzl: hourly.freezing_level_height?.[i],
        soil: hourly.soil_temperature_0cm?.[i],
        soil6: hourly.soil_temperature_6cm?.[i],
        soil18: hourly.soil_temperature_18cm?.[i],
        li: hourly.lifted_index?.[i],
        moist: hourly.soil_moisture_0_to_1cm?.[i],
        moist13: hourly.soil_moisture_1_to_3cm?.[i],
        moist39: hourly.soil_moisture_3_to_9cm?.[i],
        moist927: hourly.soil_moisture_9_to_27cm?.[i],
        moist2781: hourly.soil_moisture_27_to_81cm?.[i],
        lowCloud: hourly.cloud_cover_low?.[i],
        midCloud: hourly.cloud_cover_mid?.[i],
        highCloud: hourly.cloud_cover_high?.[i],
      });
    }
  }
  return hours;
}

export function formatFeelsLike(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `feels ${formatTemp(Number(celsius), unit)}`;
}

export function hourlyWindLabel(kmh, unit = "c", degrees) {
  if (kmh == null || Number.isNaN(Number(kmh))) return "";
  return formatWind(kmh, unit, degrees);
}

export function hourlyHumidityLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  return `${Math.round(Number(percent))}%`;
}

export function dailyUvLabel(uv) {
  const text = formatUv(uv);
  return text === "—" ? "" : text;
}

export function dailySunLabel(sunrise, sunset) {
  const text = formatSunRange(sunrise, sunset);
  return text === "—" ? "" : text;
}

export function hourlyUvLabel(uv) {
  if (uv == null || Number.isNaN(Number(uv))) return "";
  const n = Math.round(Number(uv));
  if (n <= 0) return "";
  return `UV ${n}`;
}

export function hourlyCloudLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  return formatCloud(percent);
}

export function formatSunshine(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "—";
  const mins = Math.round(Number(seconds) / 60);
  if (mins <= 0) return "0h sun";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours === 0) return `${minutes}m sun`;
  if (minutes === 0) return `${hours}h sun`;
  return `${hours}h ${minutes}m sun`;
}

export function dailySunshineLabel(seconds) {
  const text = formatSunshine(seconds);
  return text === "—" ? "" : text;
}

export function hourlyVisibilityLabel(meters, unit = "c") {
  const text = formatVisibility(meters, unit);
  return text === "—" ? "" : text;
}

export function formatPrecipHours(hours) {
  if (hours == null || Number.isNaN(Number(hours))) return "—";
  const n = Number(hours);
  if (n <= 0) return "0h rain";
  const rounded = Math.round(n * 10) / 10;
  return `${rounded}h rain`;
}

export function dailyPrecipHoursLabel(hours) {
  const text = formatPrecipHours(hours);
  if (text === "—" || text === "0h rain") return "";
  return text;
}

export function hourlyDewLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `dew ${formatTemp(Number(celsius), unit)}`;
}

export function formatGusts(kmh, unit = "c") {
  if (kmh == null || Number.isNaN(Number(kmh))) return "—";
  const speed =
    unit === "f"
      ? `${Math.round(kmhToMph(kmh))} mph`
      : `${Math.round(Number(kmh))} km/h`;
  return `gusts ${speed}`;
}

export function dailyGustLabel(gustKmh, sustainedKmh, unit = "c") {
  if (gustKmh == null || Number.isNaN(Number(gustKmh))) return "";
  const gust = Number(gustKmh);
  if (gust <= 0) return "";
  if (
    sustainedKmh != null &&
    !Number.isNaN(Number(sustainedKmh)) &&
    gust <= Number(sustainedKmh)
  ) {
    return "";
  }
  const text = formatGusts(gust, unit);
  return text === "—" ? "" : text;
}

export function hourlyPressureLabel(hPa, unit = "c") {
  const text = formatPressure(hPa, unit);
  return text === "—" ? "" : text;
}

export function formatSolar(mj) {
  if (mj == null || Number.isNaN(Number(mj))) return "—";
  const n = Number(mj);
  if (n <= 0) return "0 MJ/m²";
  const rounded = Math.round(n * 10) / 10;
  return `${rounded} MJ/m²`;
}

export function dailySolarLabel(mj) {
  const text = formatSolar(mj);
  if (text === "—" || text === "0 MJ/m²") return "";
  return text;
}

export function hourlyGustLabel(gustKmh, sustainedKmh, unit = "c") {
  return dailyGustLabel(gustKmh, sustainedKmh, unit);
}

export function formatEt0(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "—";
  const n = Number(mm);
  if (unit === "f") {
    const inches = mmToIn(n);
    if (inches === 0) return "0 in ET0";
    return `${Math.round(inches * 100) / 100} in ET0`;
  }
  if (n === 0) return "0 mm ET0";
  return `${Math.round(n * 10) / 10} mm ET0`;
}

export function dailyEt0Label(mm, unit = "c") {
  const text = formatEt0(mm, unit);
  if (text === "—" || text === "0 mm ET0" || text === "0 in ET0") return "";
  return text;
}

export function hourlyWetBulbLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `wet ${formatTemp(Number(celsius), unit)}`;
}

export function formatHumidityRange(max, min) {
  const hiOk = max != null && !Number.isNaN(Number(max));
  const loOk = min != null && !Number.isNaN(Number(min));
  if (!hiOk && !loOk) return "—";
  if (!hiOk) return `${Math.round(Number(min))}%`;
  if (!loOk) return `${Math.round(Number(max))}%`;
  const hi = Math.round(Number(max));
  const lo = Math.round(Number(min));
  if (hi === lo) return `${hi}%`;
  return `${lo}–${hi}%`;
}

export function dailyHumidityLabel(max, min) {
  const text = formatHumidityRange(max, min);
  return text === "—" ? "" : text;
}

export function hourlySnowLabel(cm, unit = "c") {
  if (cm == null || Number.isNaN(Number(cm))) return "";
  const n = Number(cm);
  if (n <= 0) return "";
  const text = formatSnowfall(n, unit);
  return text === "—" ? "" : `${text} snow`;
}

export function formatShowers(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "—";
  const n = Number(mm);
  if (unit === "f") {
    const inches = mmToIn(n);
    if (inches === 0) return "0 in showers";
    return `${Math.round(inches * 100) / 100} in showers`;
  }
  if (n === 0) return "0 mm showers";
  return `${Math.round(n * 10) / 10} mm showers`;
}

export function dailyShowersLabel(mm, unit = "c") {
  const text = formatShowers(mm, unit);
  if (text === "—" || text === "0 mm showers" || text === "0 in showers") return "";
  return text;
}

export function hourlyShowersLabel(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "";
  const n = Number(mm);
  if (n <= 0) return "";
  const text = formatShowers(n, unit);
  return text === "—" ? "" : text;
}

export function formatRain(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "—";
  const n = Number(mm);
  if (unit === "f") {
    const inches = mmToIn(n);
    if (inches === 0) return "0 in rain";
    return `${Math.round(inches * 100) / 100} in rain`;
  }
  if (n === 0) return "0 mm rain";
  return `${Math.round(n * 10) / 10} mm rain`;
}

export function dailyRainLabel(mm, unit = "c") {
  const text = formatRain(mm, unit);
  if (text === "—" || text === "0 mm rain" || text === "0 in rain") return "";
  return text;
}

export function hourlyRainLabel(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "";
  const n = Number(mm);
  if (n <= 0) return "";
  const text = formatRain(n, unit);
  return text === "—" ? "" : text;
}

export function dailyMeanTempLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `mean ${formatTemp(Number(celsius), unit)}`;
}

export function formatSnowDepth(meters, unit = "c") {
  if (meters == null || Number.isNaN(Number(meters))) return "—";
  const n = Number(meters);
  if (n <= 0) return unit === "f" ? "0 in" : "0 cm";
  return formatSnowfall(n * 100, unit);
}

export function hourlySnowDepthLabel(meters, unit = "c") {
  if (meters == null || Number.isNaN(Number(meters))) return "";
  const n = Number(meters);
  if (n <= 0) return "";
  const text = formatSnowDepth(n, unit);
  return text === "—" ? "" : `${text} depth`;
}

export function dailyFeelsMeanLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `feels mean ${formatTemp(Number(celsius), unit)}`;
}

export function formatCape(jPerKg) {
  if (jPerKg == null || Number.isNaN(Number(jPerKg))) return "—";
  const n = Number(jPerKg);
  if (n <= 0) return "0 J/kg";
  return `${Math.round(n)} J/kg`;
}

export function hourlyCapeLabel(jPerKg) {
  if (jPerKg == null || Number.isNaN(Number(jPerKg))) return "";
  if (Number(jPerKg) <= 0) return "";
  const text = formatCape(jPerKg);
  return text === "—" ? "" : text;
}

export function dailyDewMeanLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `mean dew ${formatTemp(Number(celsius), unit)}`;
}

export function formatVpd(kPa) {
  if (kPa == null || Number.isNaN(Number(kPa))) return "—";
  const n = Number(kPa);
  if (n <= 0) return "0 kPa";
  const rounded = Math.round(n * 100) / 100;
  return `${rounded} kPa`;
}

export function hourlyVpdLabel(kPa) {
  if (kPa == null || Number.isNaN(Number(kPa))) return "";
  if (Number(kPa) <= 0) return "";
  const text = formatVpd(kPa);
  return text === "—" ? "" : text;
}

export function dailyCapeMaxLabel(jPerKg) {
  const text = hourlyCapeLabel(jPerKg);
  return text ? `CAPE ${text}` : "";
}

export function hourlySunshineLabel(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "";
  if (Number(seconds) <= 0) return "";
  const text = formatSunshine(seconds);
  return text === "—" || text === "0h sun" ? "" : text;
}

export function formatDaylightDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return "—";
  const mins = Math.round(Number(seconds) / 60);
  if (mins <= 0) return "0h day";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours === 0) return `${minutes}m day`;
  if (minutes === 0) return `${hours}h day`;
  return `${hours}h ${minutes}m day`;
}

export function dailyDaylightLabel(seconds) {
  const text = formatDaylightDuration(seconds);
  if (text === "—" || text === "0h day") return "";
  return text;
}

export function formatShortwave(wm2) {
  if (wm2 == null || Number.isNaN(Number(wm2))) return "—";
  const n = Number(wm2);
  if (n <= 0) return "0 W/m²";
  return `${Math.round(n)} W/m²`;
}

export function hourlyShortwaveLabel(wm2) {
  if (wm2 == null || Number.isNaN(Number(wm2))) return "";
  if (Number(wm2) <= 0) return "";
  const text = formatShortwave(wm2);
  return text === "—" ? "" : text;
}

export function dailyClearSkyUvLabel(uv) {
  if (uv == null || Number.isNaN(Number(uv))) return "";
  if (Number(uv) <= 0) return "";
  return `clear UV ${Math.round(Number(uv))}`;
}

export function hourlyEt0Label(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "";
  if (Number(mm) <= 0) return "";
  const text = formatEt0(mm, unit);
  if (text === "—" || text === "0 mm ET0" || text === "0 in ET0") return "";
  return text;
}

export function dailyWindMinLabel(kmh, unit = "c") {
  if (kmh == null || Number.isNaN(Number(kmh))) return "";
  const n = Number(kmh);
  if (Number.isNaN(n)) return "";
  const speed =
    unit === "f"
      ? `${Math.round(kmhToMph(n))} mph`
      : `${Math.round(n)} km/h`;
  return `min ${speed}`;
}

export function formatEvapotranspiration(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "—";
  const n = Number(mm);
  if (unit === "f") {
    const inches = mmToIn(n);
    if (inches === 0) return "0 in ET";
    return `${Math.round(inches * 100) / 100} in ET`;
  }
  if (n === 0) return "0 mm ET";
  return `${Math.round(n * 10) / 10} mm ET`;
}

export function hourlyEtLabel(mm, unit = "c") {
  if (mm == null || Number.isNaN(Number(mm))) return "";
  if (Number(mm) <= 0) return "";
  const text = formatEvapotranspiration(mm, unit);
  return text === "—" ? "" : text;
}

export function dailyVpdMaxLabel(kPa) {
  const text = hourlyVpdLabel(kPa);
  return text ? `VPD ${text}` : "";
}

export function formatFreezingLevel(meters, unit = "c") {
  if (meters == null || Number.isNaN(Number(meters))) return "—";
  const n = Number(meters);
  if (unit === "f") {
    return `${Math.round(n * 3.28084)} ft FZL`;
  }
  return `${Math.round(n)} m FZL`;
}

export function hourlyFreezingLevelLabel(meters, unit = "c") {
  if (meters == null || Number.isNaN(Number(meters))) return "";
  const text = formatFreezingLevel(meters, unit);
  return text === "—" ? "" : text;
}

export function dailyPrecipMeanLabel(percent) {
  const text = formatChance(percent);
  return text ? `mean ${text}` : "";
}

export function hourlySoilTempLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `soil ${formatTemp(Number(celsius), unit)}`;
}

export function dailyHumidityMeanLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  return `mean ${Math.round(Number(percent))}%`;
}

export function dailyWetBulbMaxLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `wet max ${formatTemp(Number(celsius), unit)}`;
}

export function formatLiftedIndex(li) {
  if (li == null || Number.isNaN(Number(li))) return "—";
  const n = Number(li);
  const rounded = Math.round(n * 10) / 10;
  return `LI ${rounded}`;
}

export function hourlyLiftedIndexLabel(li) {
  if (li == null || Number.isNaN(Number(li))) return "";
  const text = formatLiftedIndex(li);
  return text === "—" ? "" : text;
}

export function dailyPrecipMinLabel(percent) {
  const text = formatChance(percent);
  return text ? `min ${text}` : "";
}

export function formatSoilMoisture(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "—";
  const pct = Math.round(Number(m3) * 100);
  return `${pct}% moist`;
}

export function hourlySoilMoistureLabel(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "";
  if (Number(m3) < 0) return "";
  const text = formatSoilMoisture(m3);
  return text === "—" ? "" : text;
}

export function dailyDewMaxLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `dew max ${formatTemp(Number(celsius), unit)}`;
}

export function formatSoilMoisture13(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "—";
  const pct = Math.round(Number(m3) * 100);
  return `${pct}% 1–3cm`;
}

export function hourlySoilMoisture13Label(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "";
  if (Number(m3) < 0) return "";
  const text = formatSoilMoisture13(m3);
  return text === "—" ? "" : text;
}

export function dailyDewMinLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `dew min ${formatTemp(Number(celsius), unit)}`;
}

export function formatSoilMoisture39(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "—";
  const pct = Math.round(Number(m3) * 100);
  return `${pct}% 3–9cm`;
}

export function hourlySoilMoisture39Label(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "";
  if (Number(m3) < 0) return "";
  const text = formatSoilMoisture39(m3);
  return text === "—" ? "" : text;
}

export function dailyWetBulbMinLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `wet min ${formatTemp(Number(celsius), unit)}`;
}

export function formatSoilMoisture927(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "—";
  const pct = Math.round(Number(m3) * 100);
  return `${pct}% 9–27cm`;
}

export function hourlySoilMoisture927Label(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "";
  if (Number(m3) < 0) return "";
  const text = formatSoilMoisture927(m3);
  return text === "—" ? "" : text;
}

export function dailyWindMeanLabel(kmh, unit = "c") {
  if (kmh == null || Number.isNaN(Number(kmh))) return "";
  const n = Number(kmh);
  if (Number.isNaN(n)) return "";
  const speed =
    unit === "f"
      ? `${Math.round(kmhToMph(n))} mph`
      : `${Math.round(n)} km/h`;
  return `mean ${speed}`;
}

export function formatSoilMoisture2781(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "—";
  const pct = Math.round(Number(m3) * 100);
  return `${pct}% 27–81cm`;
}

export function hourlySoilMoisture2781Label(m3) {
  if (m3 == null || Number.isNaN(Number(m3))) return "";
  if (Number(m3) < 0) return "";
  const text = formatSoilMoisture2781(m3);
  return text === "—" ? "" : text;
}

export function dailyCapeMinLabel(jPerKg) {
  if (jPerKg == null || Number.isNaN(Number(jPerKg))) return "";
  const text = formatCape(jPerKg);
  return text === "—" ? "" : `min CAPE ${text}`;
}

export function hourlySoilTemp6Label(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `soil 6cm ${formatTemp(Number(celsius), unit)}`;
}

export function dailyWetBulbMeanLabel(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `wet mean ${formatTemp(Number(celsius), unit)}`;
}

export function formatLowCloud(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "—";
  return `${Math.round(Number(percent))}% low`;
}

export function hourlyLowCloudLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  if (Number(percent) < 0) return "";
  const text = formatLowCloud(percent);
  return text === "—" ? "" : text;
}

export function dailyDominantWindLabel(degrees) {
  const dir = formatWindDir(degrees);
  return dir ? `wind ${dir}` : "";
}

export function formatMidCloud(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "—";
  return `${Math.round(Number(percent))}% mid`;
}

export function hourlyMidCloudLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  if (Number(percent) < 0) return "";
  const text = formatMidCloud(percent);
  return text === "—" ? "" : text;
}

export function dailyCapeMeanLabel(jPerKg) {
  if (jPerKg == null || Number.isNaN(Number(jPerKg))) return "";
  const text = formatCape(jPerKg);
  return text === "—" ? "" : `mean CAPE ${text}`;
}

export function formatHighCloud(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "—";
  return `${Math.round(Number(percent))}% high`;
}

export function hourlyHighCloudLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  if (Number(percent) < 0) return "";
  const text = formatHighCloud(percent);
  return text === "—" ? "" : text;
}

export function dailyGustMinLabel(kmh, unit = "c") {
  if (kmh == null || Number.isNaN(Number(kmh))) return "";
  const text = formatGusts(kmh, unit);
  return text === "—" ? "" : `min ${text}`;
}

export function hourlySoilTemp18Label(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return `soil 18cm ${formatTemp(Number(celsius), unit)}`;
}

export function dailyGustMeanLabel(kmh, unit = "c") {
  if (kmh == null || Number.isNaN(Number(kmh))) return "";
  const text = formatGusts(kmh, unit);
  return text === "—" ? "" : `mean ${text}`;
}

export function dailyFeelsTemp(celsius, unit = "c") {
  if (celsius == null || Number.isNaN(Number(celsius))) return "";
  return formatTemp(Number(celsius), unit);
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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseIsoParts(iso) {
  if (!iso || typeof iso !== "string") return null;
  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hasTime = match[4] != null;
  const hour = hasTime ? Number(match[4]) : 0;
  const minute = hasTime ? Number(match[5]) : 0;
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }
  return { year, month, day, hour, minute, hasTime };
}

function formatHour12(hour, minute, { withMinutes = true } = {}) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  if (!withMinutes) return `${hour12} ${suffix}`;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatSunTime(iso) {
  const parts = parseIsoParts(iso);
  if (!parts?.hasTime) return "—";
  return formatHour12(parts.hour, parts.minute);
}

export function formatHourLabel(iso) {
  const parts = parseIsoParts(iso);
  if (!parts?.hasTime) return "—";
  return formatHour12(parts.hour, parts.minute, { withMinutes: false });
}

export function formatUpdatedAt(iso) {
  const parts = parseIsoParts(iso);
  if (!parts?.hasTime) return "";
  const weekday = WEEKDAYS[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()];
  const time = formatHour12(parts.hour, parts.minute);
  return `Updated ${weekday}, ${MONTHS[parts.month - 1]} ${parts.day}, ${time}`;
}

export function formatSunRange(sunrise, sunset) {
  const rise = formatSunTime(sunrise);
  const set = formatSunTime(sunset);
  if (rise === "—" && set === "—") return "—";
  return `${rise} – ${set}`;
}

export function daylightMinutes(sunriseIso, sunsetIso) {
  const rise = clockMinutes(sunriseIso);
  const set = clockMinutes(sunsetIso);
  if (rise == null || set == null) return null;
  const mins = set - rise;
  if (mins <= 0) return null;
  return mins;
}

export function formatDaylight(sunriseIso, sunsetIso) {
  const mins = daylightMinutes(sunriseIso, sunsetIso);
  if (mins == null) return "—";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function humidityComfort(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  const n = Number(percent);
  if (n < 30) return "Dry";
  if (n <= 60) return "Comfortable";
  if (n <= 80) return "Humid";
  return "Muggy";
}

export function formatHumidity(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "—";
  const n = Math.round(Number(percent));
  const comfort = humidityComfort(n);
  return comfort ? `${n}% ${comfort}` : `${n}%`;
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
  const parts = parseIsoParts(iso);
  if (!parts?.hasTime) return null;
  return parts.hour * 60 + parts.minute;
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

export function hPaToInHg(hPa) {
  return Number(hPa) * 0.02953;
}

export function formatPressure(hPa, unit = "c") {
  if (hPa == null || Number.isNaN(Number(hPa))) return "—";
  if (unit === "f") {
    return `${(Math.round(hPaToInHg(hPa) * 100) / 100).toFixed(2)} inHg`;
  }
  return `${Math.round(Number(hPa))} hPa`;
}

export function formatPm25(ugm3) {
  if (ugm3 == null || Number.isNaN(Number(ugm3))) return "—";
  return `${Math.round(Number(ugm3))} µg/m³`;
}

export function formatAqiDetail(aqi, pm25) {
  const aqiText = formatAqi(aqi);
  if (aqiText === "—") return "—";
  const particles = formatPm25(pm25);
  if (particles === "—") return aqiText;
  return `${aqiText} · ${particles}`;
}

export function formatVisibility(meters, unit = "c") {
  if (meters == null || Number.isNaN(Number(meters))) return "—";
  const m = Number(meters);
  if (m < 0) return "—";
  if (unit === "f") {
    const miles = m / 1609.344;
    if (miles >= 10) return `${Math.round(miles)} mi`;
    if (miles >= 0.1) return `${Math.round(miles * 10) / 10} mi`;
    return `${Math.round(miles * 100) / 100} mi`;
  }
  const km = m / 1000;
  if (km >= 10) return `${Math.round(km)} km`;
  if (km >= 1) return `${Math.round(km * 10) / 10} km`;
  return `${Math.round(m)} m`;
}

export function dailyPrecipParts(chance, mm, unit = "c") {
  const pct = formatChance(chance);
  const amt = formatPrecip(mm, unit);
  const showAmt = amt !== "—" && amt !== "0 mm" && amt !== "0 in";
  return { chance: pct, amount: showAmt ? amt : "" };
}

export function cloudCoverLabel(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "";
  const n = Number(percent);
  if (n <= 10) return "Clear";
  if (n <= 30) return "Mostly clear";
  if (n <= 70) return "Partly cloudy";
  if (n <= 90) return "Mostly cloudy";
  return "Overcast";
}

export function formatCloud(percent) {
  if (percent == null || Number.isNaN(Number(percent))) return "—";
  const n = Math.round(Number(percent));
  const label = cloudCoverLabel(n);
  return label ? `${n}% ${label}` : `${n}%`;
}

export function cmToIn(cm) {
  return Number(cm) / 2.54;
}

export function formatSnowfall(cm, unit = "c") {
  if (cm == null || Number.isNaN(Number(cm))) return "—";
  const n = Number(cm);
  if (unit === "f") {
    if (n === 0) return "0 in";
    return `${Math.round(cmToIn(n) * 100) / 100} in`;
  }
  if (n === 0) return "0 cm";
  return `${Math.round(n * 10) / 10} cm`;
}

export function dailySnowAmount(cm, unit = "c") {
  const amt = formatSnowfall(cm, unit);
  if (amt === "—" || amt === "0 cm" || amt === "0 in") return "";
  return amt;
}

const isBrowser = typeof document !== "undefined";

const els = isBrowser
  ? {
      form: document.getElementById("search-form"),
      input: document.getElementById("city-input"),
      suggestions: document.getElementById("suggestions"),
      locate: document.getElementById("locate-btn"),
      recents: document.getElementById("recents"),
      refresh: document.getElementById("refresh-btn"),
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
      daylight: document.getElementById("daylight"),
      uv: document.getElementById("uv"),
      aqi: document.getElementById("aqi"),
      dew: document.getElementById("dew"),
      pressure: document.getElementById("pressure"),
      visibility: document.getElementById("visibility"),
      cloud: document.getElementById("cloud"),
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
  recents:
    isBrowser && typeof localStorage !== "undefined"
      ? parseRecents(localStorage.getItem(RECENTS_KEY))
      : [],
  suggestTimer: null,
  highlightIndex: -1,
  busy: false,
};

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.classList.toggle("is-error", isError);
}

function setBusy(busy) {
  state.busy = busy;
  if (els.form) els.form.setAttribute("aria-busy", String(busy));
  if (els.current) els.current.setAttribute("aria-busy", String(busy));
  if (els.locate) els.locate.disabled = busy;
  if (els.refresh) els.refresh.disabled = busy || !state.place;
}

function renderRecents() {
  if (!els.recents) return;
  els.recents.innerHTML = "";
  if (!state.recents.length) {
    els.recents.hidden = true;
    return;
  }
  const currentKey = state.place ? placeKey(state.place) : "";
  for (const place of state.recents) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "recent";
    btn.textContent = place.name;
    btn.title = placeLabel(place);
    if (placeKey(place) === currentKey) {
      btn.classList.add("is-active");
      btn.setAttribute("aria-current", "location");
    }
    btn.addEventListener("click", () => {
      if (els.input) els.input.value = place.name;
      loadPlace(place);
    });
    li.append(btn);
    els.recents.append(li);
  }
  els.recents.hidden = false;
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
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,dew_point_2m,pressure_msl,visibility,cloud_cover",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,apparent_temperature,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,uv_index,cloud_cover,visibility,dew_point_2m,pressure_msl,wet_bulb_temperature_2m,snowfall,showers,rain,snow_depth,cape,vapour_pressure_deficit,sunshine_duration,shortwave_radiation,et0_fao_evapotranspiration,evapotranspiration,freezing_level_height,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,lifted_index,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm,cloud_cover_low,cloud_cover_mid,cloud_cover_high",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,apparent_temperature_mean,precipitation_probability_max,precipitation_probability_mean,precipitation_probability_min,precipitation_sum,snowfall_sum,sunrise,sunset,uv_index_max,uv_index_clear_sky_max,wind_speed_10m_max,wind_speed_10m_min,wind_speed_10m_mean,wind_gusts_10m_max,wind_gusts_10m_min,wind_gusts_10m_mean,wind_direction_10m_dominant,sunshine_duration,precipitation_hours,shortwave_radiation_sum,et0_fao_evapotranspiration,relative_humidity_2m_max,relative_humidity_2m_min,relative_humidity_2m_mean,showers_sum,rain_sum,dew_point_2m_mean,dew_point_2m_max,dew_point_2m_min,cape_max,cape_min,cape_mean,daylight_duration,vapour_pressure_deficit_max,wet_bulb_temperature_2m_max,wet_bulb_temperature_2m_min,wet_bulb_temperature_2m_mean",
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
  setBusy(true);
  try {
    const [forecast, air] = await Promise.all([
      fetchForecast(place.latitude, place.longitude),
      fetchAirQuality(place.latitude, place.longitude).catch(() => null),
    ]);
    state.place = place;
    state.forecast = forecast;
    state.air = air;
    state.recents = rememberRecent(state.recents, place);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
    localStorage.setItem(RECENTS_KEY, JSON.stringify(state.recents));
    render();
    setStatus("");
  } catch (err) {
    setStatus(err.message || "Could not load weather.", true);
  } finally {
    setBusy(false);
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
  els.updated.textContent = formatUpdatedAt(current.time);
  els.icon.textContent = wx.icon;
  els.temp.textContent = formatTemp(current.temperature_2m, unit);
  els.summary.textContent = wx.label;
  els.feels.textContent = formatTemp(current.apparent_temperature, unit);
  els.humidity.textContent = formatHumidity(current.relative_humidity_2m);
  els.wind.textContent = formatWind(
    current.wind_speed_10m,
    unit,
    current.wind_direction_10m,
    current.wind_gusts_10m,
  );
  els.hiLo.textContent = `${formatTemp(forecast.daily.temperature_2m_max[0], unit)} / ${formatTemp(forecast.daily.temperature_2m_min[0], unit)}`;
  if (els.precip) els.precip.textContent = formatPrecip(current.precipitation, unit);
  if (els.sun) {
    els.sun.textContent = formatSunRange(
      forecast.daily.sunrise?.[0],
      forecast.daily.sunset?.[0],
    );
  }
  if (els.daylight) {
    els.daylight.textContent = formatDaylight(
      forecast.daily.sunrise?.[0],
      forecast.daily.sunset?.[0],
    );
  }
  if (els.uv) els.uv.textContent = formatUv(forecast.daily.uv_index_max?.[0]);
  if (els.dew) {
    els.dew.textContent =
      current.dew_point_2m == null || Number.isNaN(Number(current.dew_point_2m))
        ? "—"
        : formatTemp(current.dew_point_2m, unit);
  }
  if (els.pressure) els.pressure.textContent = formatPressure(current.pressure_msl, unit);
  if (els.visibility) els.visibility.textContent = formatVisibility(current.visibility, unit);
  if (els.cloud) els.cloud.textContent = formatCloud(current.cloud_cover);
  if (els.aqi) els.aqi.textContent = formatAqiDetail(air?.current?.us_aqi, air?.current?.pm2_5);
  els.current.hidden = false;
  if (els.refresh) els.refresh.hidden = false;
  renderRecents();

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
      const label = formatHourLabel(h.time);
      const precip = dailyPrecipParts(h.precip, h.amount, unit);
      const feels = formatFeelsLike(h.feels, unit);
      const wind = hourlyWindLabel(h.wind, unit, h.dir);
      const humidity = hourlyHumidityLabel(h.humidity);
      const uv = hourlyUvLabel(h.uv);
      const cloud = hourlyCloudLabel(h.cloud);
      const vis = hourlyVisibilityLabel(h.visibility, unit);
      const dew = hourlyDewLabel(h.dew, unit);
      const pressure = hourlyPressureLabel(h.pressure, unit);
      const gusts = hourlyGustLabel(h.gust, h.wind, unit);
      const wet = hourlyWetBulbLabel(h.wet, unit);
      const snow = hourlySnowLabel(h.snow, unit);
      const showers = hourlyShowersLabel(h.showers, unit);
      const rain = hourlyRainLabel(h.rain, unit);
      const depth = hourlySnowDepthLabel(h.depth, unit);
      const cape = hourlyCapeLabel(h.cape);
      const vpd = hourlyVpdLabel(h.vpd);
      const shine = hourlySunshineLabel(h.shine);
      const sw = hourlyShortwaveLabel(h.sw);
      const et0Hour = hourlyEt0Label(h.et0, unit);
      const et = hourlyEtLabel(h.et, unit);
      const fzl = hourlyFreezingLevelLabel(h.fzl, unit);
      const soil = hourlySoilTempLabel(h.soil, unit);
      const soil6 = hourlySoilTemp6Label(h.soil6, unit);
      const soil18 = hourlySoilTemp18Label(h.soil18, unit);
      const lifted = hourlyLiftedIndexLabel(h.li);
      const moist = hourlySoilMoistureLabel(h.moist);
      const moist13 = hourlySoilMoisture13Label(h.moist13);
      const moist39 = hourlySoilMoisture39Label(h.moist39);
      const moist927 = hourlySoilMoisture927Label(h.moist927);
      const moist2781 = hourlySoilMoisture2781Label(h.moist2781);
      const lowCloud = hourlyLowCloudLabel(h.lowCloud);
      const midCloud = hourlyMidCloudLabel(h.midCloud);
      const highCloud = hourlyHighCloudLabel(h.highCloud);
      const feelsHtml = feels ? `<div class="p feels">${feels}</div>` : "";
      const windHtml = wind ? `<div class="p wind">${wind}</div>` : "";
      const humidityHtml = humidity ? `<div class="p humidity">${humidity}</div>` : "";
      const uvHtml = uv ? `<div class="p uv">${uv}</div>` : "";
      const cloudHtml = cloud ? `<div class="p cloud">${cloud}</div>` : "";
      const visHtml = vis ? `<div class="p vis">${vis}</div>` : "";
      const dewHtml = dew ? `<div class="p dew">${dew}</div>` : "";
      const wetHtml = wet ? `<div class="p wet">${wet}</div>` : "";
      const pressureHtml = pressure ? `<div class="p pressure">${pressure}</div>` : "";
      const gustHtml = gusts ? `<div class="p gust">${gusts}</div>` : "";
      const chanceHtml = precip.chance ? `<div class="p">${precip.chance}</div>` : "";
      const amtHtml = precip.amount ? `<div class="p amt">${precip.amount}</div>` : "";
      const snowHtml = snow ? `<div class="p snow">${snow}</div>` : "";
      const showersHtml = showers ? `<div class="p showers">${showers}</div>` : "";
      const rainHtml = rain ? `<div class="p rain">${rain}</div>` : "";
      const depthHtml = depth ? `<div class="p depth">${depth}</div>` : "";
      const capeHtml = cape ? `<div class="p cape">${cape}</div>` : "";
      const vpdHtml = vpd ? `<div class="p vpd">${vpd}</div>` : "";
      const shineHtml = shine ? `<div class="p shine">${shine}</div>` : "";
      const swHtml = sw ? `<div class="p sw">${sw}</div>` : "";
      const et0HourHtml = et0Hour ? `<div class="p et0">${et0Hour}</div>` : "";
      const etHtml = et ? `<div class="p et">${et}</div>` : "";
      const fzlHtml = fzl ? `<div class="p fzl">${fzl}</div>` : "";
      const soilHtml = soil ? `<div class="p soil">${soil}</div>` : "";
      const soil6Html = soil6 ? `<div class="p soil6">${soil6}</div>` : "";
      const soil18Html = soil18 ? `<div class="p soil18">${soil18}</div>` : "";
      const liftedHtml = lifted ? `<div class="p li">${lifted}</div>` : "";
      const moistHtml = moist ? `<div class="p moist">${moist}</div>` : "";
      const moist13Html = moist13 ? `<div class="p moist13">${moist13}</div>` : "";
      const moist39Html = moist39 ? `<div class="p moist39">${moist39}</div>` : "";
      const moist927Html = moist927 ? `<div class="p moist927">${moist927}</div>` : "";
      const moist2781Html = moist2781 ? `<div class="p moist2781">${moist2781}</div>` : "";
      const lowCloudHtml = lowCloud ? `<div class="p low-cloud">${lowCloud}</div>` : "";
      const midCloudHtml = midCloud ? `<div class="p mid-cloud">${midCloud}</div>` : "";
      const highCloudHtml = highCloud ? `<div class="p high-cloud">${highCloud}</div>` : "";
      return `<li><div class="t">${label}</div><div class="i">${d.icon}</div><div>${formatTemp(h.temp, unit)}</div>${feelsHtml}${windHtml}${gustHtml}${humidityHtml}${uvHtml}${cloudHtml}${visHtml}${dewHtml}${wetHtml}${pressureHtml}${chanceHtml}${amtHtml}${snowHtml}${showersHtml}${rainHtml}${depthHtml}${capeHtml}${vpdHtml}${shineHtml}${swHtml}${et0HourHtml}${etHtml}${fzlHtml}${soilHtml}${soil6Html}${soil18Html}${liftedHtml}${moistHtml}${moist13Html}${moist39Html}${moist927Html}${moist2781Html}${lowCloudHtml}${midCloudHtml}${highCloudHtml}</li>`;
    })
    .join("");
  els.hourlyWrap.hidden = hours.length === 0;

  els.daily.innerHTML = forecast.daily.time
    .map((day, i) => {
      const d = describeWeather(forecast.daily.weather_code[i]);
      const name = forecastDayName(day, forecast.current.time);
      const precip = dailyPrecipParts(
        forecast.daily.precipitation_probability_max?.[i],
        forecast.daily.precipitation_sum?.[i],
        unit,
      );
      const snow = dailySnowAmount(forecast.daily.snowfall_sum?.[i], unit);
      const windSpeed = forecast.daily.wind_speed_10m_max?.[i];
      const wind =
        windSpeed == null || Number.isNaN(Number(windSpeed))
          ? ""
          : formatWind(
              windSpeed,
              unit,
              forecast.daily.wind_direction_10m_dominant?.[i],
            );
      const precipTitle = precip.chance && precip.amount
        ? "Chance of precipitation and daily total"
        : precip.amount
          ? "Precipitation"
          : precip.chance
            ? "Chance of precipitation"
            : snow
              ? "Snowfall"
              : "";
      const precipHtml = `${precip.chance ? `<span>${precip.chance}</span>` : ""}${
        precip.amount ? `<span class="amt">${precip.amount}</span>` : ""
      }${snow ? `<span class="amt snow">${snow} snow</span>` : ""}`;
      const uv = dailyUvLabel(forecast.daily.uv_index_max?.[i]);
      const sun = dailySunLabel(
        forecast.daily.sunrise?.[i],
        forecast.daily.sunset?.[i],
      );
      const sunshine = dailySunshineLabel(forecast.daily.sunshine_duration?.[i]);
      const precipHours = dailyPrecipHoursLabel(forecast.daily.precipitation_hours?.[i]);
      const gusts = dailyGustLabel(
        forecast.daily.wind_gusts_10m_max?.[i],
        windSpeed,
        unit,
      );
      const feelsHi = dailyFeelsTemp(
        forecast.daily.apparent_temperature_max?.[i],
        unit,
      );
      const feelsLo = dailyFeelsTemp(
        forecast.daily.apparent_temperature_min?.[i],
        unit,
      );
      const windHtml = wind
        ? `<span class="day-wind" title="Peak wind">${wind}</span>`
        : "";
      const uvHtml = uv
        ? `<span class="day-uv" title="Peak UV">${uv}</span>`
        : "";
      const sunHtml = sun
        ? `<span class="day-sun" title="Sunrise – sunset">${sun}</span>`
        : "";
      const sunshineHtml = sunshine
        ? `<span class="day-shine" title="Sunshine duration">${sunshine}</span>`
        : "";
      const precipHoursHtml = precipHours
        ? `<span class="day-rain-hrs" title="Hours of precipitation">${precipHours}</span>`
        : "";
      const gustHtml = gusts
        ? `<span class="day-gust" title="Peak wind gusts">${gusts}</span>`
        : "";
      const solar = dailySolarLabel(forecast.daily.shortwave_radiation_sum?.[i]);
      const solarHtml = solar
        ? `<span class="day-solar" title="Solar radiation">${solar}</span>`
        : "";
      const et0 = dailyEt0Label(
        forecast.daily.et0_fao_evapotranspiration?.[i],
        unit,
      );
      const et0Html = et0
        ? `<span class="day-et0" title="Reference evapotranspiration">${et0}</span>`
        : "";
      const humidityRange = dailyHumidityLabel(
        forecast.daily.relative_humidity_2m_max?.[i],
        forecast.daily.relative_humidity_2m_min?.[i],
      );
      const humidityRangeHtml = humidityRange
        ? `<span class="day-rh" title="Humidity range">${humidityRange}</span>`
        : "";
      const showers = dailyShowersLabel(forecast.daily.showers_sum?.[i], unit);
      const showersHtml = showers
        ? `<span class="day-showers" title="Convective showers">${showers}</span>`
        : "";
      const rain = dailyRainLabel(forecast.daily.rain_sum?.[i], unit);
      const rainHtml = rain
        ? `<span class="day-rain" title="Liquid rain">${rain}</span>`
        : "";
      const mean = dailyMeanTempLabel(
        forecast.daily.temperature_2m_mean?.[i],
        unit,
      );
      const meanHtml = mean
        ? `<span class="day-mean" title="Mean temperature">${mean}</span>`
        : "";
      const feelsMean = dailyFeelsMeanLabel(
        forecast.daily.apparent_temperature_mean?.[i],
        unit,
      );
      const feelsMeanHtml = feelsMean
        ? `<span class="day-feels-mean" title="Mean feels-like">${feelsMean}</span>`
        : "";
      const dewMean = dailyDewMeanLabel(forecast.daily.dew_point_2m_mean?.[i], unit);
      const dewMeanHtml = dewMean
        ? `<span class="day-dew-mean" title="Mean dew point">${dewMean}</span>`
        : "";
      const capeMax = dailyCapeMaxLabel(forecast.daily.cape_max?.[i]);
      const capeMaxHtml = capeMax
        ? `<span class="day-cape" title="Peak CAPE">${capeMax}</span>`
        : "";
      const daylight = dailyDaylightLabel(forecast.daily.daylight_duration?.[i]);
      const daylightHtml = daylight
        ? `<span class="day-daylight" title="Daylight duration">${daylight}</span>`
        : "";
      const clearUv = dailyClearSkyUvLabel(forecast.daily.uv_index_clear_sky_max?.[i]);
      const clearUvHtml = clearUv
        ? `<span class="day-clear-uv" title="Peak clear-sky UV">${clearUv}</span>`
        : "";
      const windMin = dailyWindMinLabel(
        forecast.daily.wind_speed_10m_min?.[i],
        unit,
      );
      const windMinHtml = windMin
        ? `<span class="day-wind-min" title="Minimum wind">${windMin}</span>`
        : "";
      const vpdMax = dailyVpdMaxLabel(forecast.daily.vapour_pressure_deficit_max?.[i]);
      const vpdMaxHtml = vpdMax
        ? `<span class="day-vpd" title="Peak vapour pressure deficit">${vpdMax}</span>`
        : "";
      const precipMean = dailyPrecipMeanLabel(
        forecast.daily.precipitation_probability_mean?.[i],
      );
      const precipMeanHtml = precipMean
        ? `<span class="day-precip-mean" title="Mean chance of precipitation">${precipMean}</span>`
        : "";
      const humidityMean = dailyHumidityMeanLabel(
        forecast.daily.relative_humidity_2m_mean?.[i],
      );
      const humidityMeanHtml = humidityMean
        ? `<span class="day-rh-mean" title="Mean humidity">${humidityMean}</span>`
        : "";
      const wetMax = dailyWetBulbMaxLabel(
        forecast.daily.wet_bulb_temperature_2m_max?.[i],
        unit,
      );
      const wetMaxHtml = wetMax
        ? `<span class="day-wet-max" title="Peak wet-bulb">${wetMax}</span>`
        : "";
      const precipMin = dailyPrecipMinLabel(
        forecast.daily.precipitation_probability_min?.[i],
      );
      const precipMinHtml = precipMin
        ? `<span class="day-precip-min" title="Minimum chance of precipitation">${precipMin}</span>`
        : "";
      const dewMax = dailyDewMaxLabel(forecast.daily.dew_point_2m_max?.[i], unit);
      const dewMaxHtml = dewMax
        ? `<span class="day-dew-max" title="Peak dew point">${dewMax}</span>`
        : "";
      const dewMin = dailyDewMinLabel(forecast.daily.dew_point_2m_min?.[i], unit);
      const dewMinHtml = dewMin
        ? `<span class="day-dew-min" title="Minimum dew point">${dewMin}</span>`
        : "";
      const wetMin = dailyWetBulbMinLabel(
        forecast.daily.wet_bulb_temperature_2m_min?.[i],
        unit,
      );
      const wetMinHtml = wetMin
        ? `<span class="day-wet-min" title="Minimum wet-bulb">${wetMin}</span>`
        : "";
      const windMean = dailyWindMeanLabel(
        forecast.daily.wind_speed_10m_mean?.[i],
        unit,
      );
      const windMeanHtml = windMean
        ? `<span class="day-wind-mean" title="Mean wind">${windMean}</span>`
        : "";
      const capeMin = dailyCapeMinLabel(forecast.daily.cape_min?.[i]);
      const capeMinHtml = capeMin
        ? `<span class="day-cape-min" title="Minimum CAPE">${capeMin}</span>`
        : "";
      const wetMean = dailyWetBulbMeanLabel(
        forecast.daily.wet_bulb_temperature_2m_mean?.[i],
        unit,
      );
      const wetMeanHtml = wetMean
        ? `<span class="day-wet-mean" title="Mean wet-bulb">${wetMean}</span>`
        : "";
      const windDir = dailyDominantWindLabel(
        forecast.daily.wind_direction_10m_dominant?.[i],
      );
      const windDirHtml = windDir
        ? `<span class="day-wind-dir" title="Dominant wind direction">${windDir}</span>`
        : "";
      const capeMean = dailyCapeMeanLabel(forecast.daily.cape_mean?.[i]);
      const capeMeanHtml = capeMean
        ? `<span class="day-cape-mean" title="Mean CAPE">${capeMean}</span>`
        : "";
      const gustMin = dailyGustMinLabel(
        forecast.daily.wind_gusts_10m_min?.[i],
        unit,
      );
      const gustMinHtml = gustMin
        ? `<span class="day-gust-min" title="Minimum wind gusts">${gustMin}</span>`
        : "";
      const gustMean = dailyGustMeanLabel(
        forecast.daily.wind_gusts_10m_mean?.[i],
        unit,
      );
      const gustMeanHtml = gustMean
        ? `<span class="day-gust-mean" title="Mean wind gusts">${gustMean}</span>`
        : "";
      return `<li>
        <span>${name}${windHtml}${windMinHtml}${windMeanHtml}${windDirHtml}${gustHtml}${gustMinHtml}${gustMeanHtml}${uvHtml}${clearUvHtml}${sunHtml}${sunshineHtml}${daylightHtml}${solarHtml}${et0Html}${humidityRangeHtml}${humidityMeanHtml}${showersHtml}${rainHtml}${precipHoursHtml}${precipMeanHtml}${precipMinHtml}${meanHtml}${feelsMeanHtml}${dewMeanHtml}${dewMaxHtml}${dewMinHtml}${capeMaxHtml}${capeMinHtml}${capeMeanHtml}${vpdMaxHtml}${wetMaxHtml}${wetMinHtml}${wetMeanHtml}</span>
        <span class="i">${d.icon}</span>
        <span class="chance"${precipTitle ? ` title="${precipTitle}"` : ""}>${precipHtml}</span>
        <span class="hi">${formatTemp(forecast.daily.temperature_2m_max[i], unit)}${
          feelsHi ? `<span class="feels-ext" title="Feels like">${feelsHi}</span>` : ""
        }</span>
        <span class="lo">${formatTemp(forecast.daily.temperature_2m_min[i], unit)}${
          feelsLo ? `<span class="feels-ext" title="Feels like">${feelsLo}</span>` : ""
        }</span>
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
  if (els.refresh) {
    els.refresh.addEventListener("click", () => {
      if (state.place) loadPlace(state.place);
    });
  }
  els.unitC.addEventListener("click", () => setUnit("c"));
  els.unitF.addEventListener("click", () => setUnit("f"));
  setUnit(state.unit);
  renderRecents();

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

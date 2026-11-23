import { ECONOMIC_SERIES, seriesUrl, normalizeSeries, WEATHER_URL, normalizeWeather, fetchJson } from '../src/providers.js';
const now = new Date();
let failures = 0;
for (const series of ECONOMIC_SERIES) {
  try { const data = normalizeSeries(await fetchJson(seriesUrl(series, now)), series, now); console.log(`${series.name}: ${data.history.at(-1).value} ${series.unit} | reference ${data.history.at(-1).date} | ${data.history.length} verified observations`); }
  catch (error) { failures++; console.error(`${series.name}: UNAVAILABLE (${error.message})`); }
}
try { const data = normalizeWeather(await fetchJson(WEATHER_URL), new Date()); console.log(`Belo Horizonte: ${data.temperature} °C | ${data.condition} | observed ${data.observedAt}`); }
catch (error) { failures++; console.error(`Weather: UNAVAILABLE (${error.message})`); }
process.exitCode = failures ? 1 : 0;

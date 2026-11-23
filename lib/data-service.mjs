import { ECONOMIC_SERIES, WEATHER_URL, fetchJson, seriesUrl, normalizeSeries, normalizeWeather, validSeriesPayload, validWeatherPayload } from '../src/providers.js';

// One request per provider/series at a time. Failed refreshes preserve the last real observation.
export function createDataService({ fetcher = fetch, now = () => new Date(), retryMs = 5 * 60000, onChange = () => {} } = {}) {
  const slots = new Map();
  async function read(id, load, ttl, validate) {
    let slot = slots.get(id);
    if (!slot) { slot = { data: null, attempt: 0, failed: false, pending: null }; slots.set(id, slot); }
    const current = now();
    if (slot.data && !validate(slot.data, current)) slot.data = null;
    const fresh = slot.data && +current - Date.parse(slot.data.fetchedAt) < ttl && !slot.failed;
    if (!fresh && (!slot.attempt || +current - slot.attempt >= (slot.failed ? retryMs : 0))) {
      if (!slot.pending) {
        slot.attempt = +current;
        slot.pending = (async () => {
          try { slot.data = await load(); slot.failed = false; onChange(); }
          catch { slot.failed = true; }
          finally { slot.pending = null; }
        })();
      }
      await slot.pending;
    } else if (slot.pending) await slot.pending;
    return { id, status: !slot.data ? 'unavailable' : slot.failed ? 'cached' : 'ok', data: slot.data, attemptedAt: slot.attempt ? new Date(slot.attempt).toISOString() : null };
  }
  return {
    async economy() {
      const items = await Promise.all(ECONOMIC_SERIES.map(series => read(series.id, async () => normalizeSeries(await fetchJson(seriesUrl(series, now()), { fetcher }), series, now()), 3600000, (value, date) => validSeriesPayload(value, series, date) && +date - Date.parse(value.fetchedAt) < 7 * 86400000)));
      return { items };
    },
    weather() { return read('weather', async () => normalizeWeather(await fetchJson(WEATHER_URL, { fetcher }), now()), 15 * 60000, validWeatherPayload); },
    snapshot() { return Object.fromEntries([...slots].filter(([, value]) => value.data).map(([id, value]) => [id, value.data])); },
    restore(snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return;
      for (const series of ECONOMIC_SERIES) {
        const data = snapshot[series.id];
        if (validSeriesPayload(data, series, now()) && +now() - Date.parse(data.fetchedAt) < 7 * 86400000) slots.set(series.id, { data, attempt: 0, failed: false, pending: null });
      }
      if (validWeatherPayload(snapshot.weather, now())) slots.set('weather', { data: snapshot.weather, attempt: 0, failed: false, pending: null });
    }
  };
}

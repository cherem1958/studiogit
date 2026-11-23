import { dayKey, validDay } from './core.js';
export const ECONOMIC_SERIES = [
  { id: 'usd', code: 1, name: 'USD / BRL', unit: 'BRL per USD', frequency: 'daily', origin: 'BCB · PTAX selling rate', digits: 4, description: 'Brazilian reais per US dollar. Official daily selling reference, not an intraday trading quote.' },
  { id: 'eur', code: 21619, name: 'EUR / BRL', unit: 'BRL per EUR', frequency: 'daily', origin: 'BCB · Euro selling rate', digits: 4, description: 'Brazilian reais per euro. Official daily selling reference, not an intraday trading quote.' },
  { id: 'selic', code: 432, name: 'Selic target', unit: '% per year', frequency: 'daily', origin: 'BCB · Copom', digits: 2, description: 'Policy interest-rate target set by Copom. Recorded daily; the target changes only after policy decisions.' },
  { id: 'cdi', code: 4389, name: 'CDI', unit: '% per year', frequency: 'daily', origin: 'BCB · B3', digits: 2, description: 'Annualized interbank deposit rate, based on 252 business days. This is not a daily percentage return.' },
  { id: 'ipca12', code: 13522, name: 'IPCA · 12 months', unit: '% over 12 months', frequency: 'monthly', origin: 'IBGE via BCB', digits: 2, description: 'Consumer-price inflation accumulated over twelve months. Published monthly, not daily.' },
  { id: 'ipca', code: 433, name: 'IPCA · monthly', unit: '% month over month', frequency: 'monthly', origin: 'IBGE via BCB', digits: 2, description: 'Monthly change in the broad consumer-price index. The reference is the measured month, not its publication date.' }
];
export const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-19.9208&longitude=-43.9378&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=1';
export function seriesSource(series) { return `https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarGraficoPorId&hdOidSeriesSelecionadas=${series.code}`; }
export function seriesUrl(series, now = new Date()) {
  const end = dayKey(now), start = new Date(end + 'T12:00:00Z');
  start.setUTCDate(start.getUTCDate() - (series.frequency === 'monthly' ? 450 : 90));
  const bcbDate = value => value.split('-').reverse().join('/');
  const params = new URLSearchParams({ formato: 'json', dataInicial: bcbDate(start.toISOString().slice(0, 10)), dataFinal: bcbDate(end) });
  return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series.code}/dados?${params}`;
}
export async function fetchJson(url, { fetcher = fetch, timeout = 12000 } = {}) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetcher(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 1000000) throw new Error('Provider response too large');
    return JSON.parse(text);
  } finally { clearTimeout(timer); }
}
export function normalizeSeries(rows, series, now = new Date()) {
  if (!Array.isArray(rows) || rows.length > 5000) throw new Error('Invalid economic response');
  const today = dayKey(now), points = new Map();
  for (const row of rows) {
    if (!row || typeof row.data !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(row.data)) throw new Error('Invalid economic date');
    const date = row.data.split('/').reverse().join('-');
    if (!validDay(date)) throw new Error('Invalid economic date');
    if (date > today) continue;
    const raw = row.valor;
    if (typeof raw !== 'string' || !/^-?\d+(?:[.,]\d+)?$/.test(raw.trim())) throw new Error('Invalid economic value');
    const value = Number(raw.replace(',', '.'));
    if (!Number.isFinite(value) || Math.abs(value) > 1000000 || (['usd', 'eur'].includes(series.id) && value <= 0)) throw new Error('Invalid economic value');
    if (points.has(date) && points.get(date) !== value) throw new Error('Conflicting economic observations');
    points.set(date, value);
  }
  const history = [...points].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([date, value]) => ({ date, value }));
  if (!history.length) throw new Error('No published observations');
  return { id: series.id, history, fetchedAt: now.toISOString() };
}
export function validSeriesPayload(data, series, now = new Date()) {
  if (!data || data.id !== series.id || !Array.isArray(data.history) || !data.history.length || data.history.length > 12 || typeof data.fetchedAt !== 'string') return false;
  const stamp = Date.parse(data.fetchedAt);
  if (!Number.isFinite(stamp) || stamp > +now + 60000) return false;
  return data.history.every((point, index) => point && validDay(point.date) && point.date <= dayKey(now) && Number.isFinite(point.value) && Math.abs(point.value) <= 1000000 && (!['usd', 'eur'].includes(series.id) || point.value > 0) && (!index || data.history[index - 1].date < point.date));
}
export function weatherDescription(code) {
  if (code === 0) return 'Clear sky';
  if ([1, 2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorms';
  return 'Conditions unavailable';
}
export function normalizeWeather(data, now = new Date()) {
  const current = data?.current, daily = data?.daily?.time?.[0] === dayKey(now) ? data.daily : null;
  const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
  if (!current || !finite(current.temperature_2m, -80, 65) || !Number.isInteger(current.weather_code) || typeof current.time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(current.time)) throw new Error('Invalid weather response');
  const observed = Date.parse(current.time + '-03:00');
  if (!validDay(current.time.slice(0, 10)) || !Number.isFinite(observed) || observed > +now + 3600000 || +now - observed > 6 * 3600000) throw new Error('Weather observation is out of date');
  return {
    temperature: current.temperature_2m, condition: weatherDescription(current.weather_code), observedAt: new Date(observed).toISOString(), fetchedAt: now.toISOString(),
    feelsLike: finite(current.apparent_temperature, -80, 80) ? current.apparent_temperature : null,
    humidity: finite(current.relative_humidity_2m, 0, 100) ? current.relative_humidity_2m : null,
    min: finite(daily?.temperature_2m_min?.[0], -80, 65) ? daily.temperature_2m_min[0] : null,
    max: finite(daily?.temperature_2m_max?.[0], -80, 65) ? daily.temperature_2m_max[0] : null,
    rain: finite(daily?.precipitation_probability_max?.[0], 0, 100) ? daily.precipitation_probability_max[0] : null
  };
}
export function validWeatherPayload(data, now = new Date()) {
  if (!data || !Number.isFinite(data.temperature) || data.temperature < -80 || data.temperature > 65 || typeof data.condition !== 'string' || data.condition.length > 60) return false;
  const observed = Date.parse(data.observedAt), fetched = Date.parse(data.fetchedAt);
  const bounded = (key, min, max) => data[key] === null || Number.isFinite(data[key]) && data[key] >= min && data[key] <= max;
  return Number.isFinite(observed) && Number.isFinite(fetched) && observed <= +now + 3600000 && +now - observed <= 6 * 3600000 && fetched <= +now + 60000 && bounded('feelsLike', -80, 80) && bounded('humidity', 0, 100) && bounded('rain', 0, 100) && bounded('min', -80, 65) && bounded('max', -80, 65) && (data.min === null || data.max === null || data.min <= data.max);
}

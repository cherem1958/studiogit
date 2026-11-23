import test from 'node:test';
import assert from 'node:assert/strict';
import { ECONOMIC_SERIES, seriesUrl, normalizeSeries, normalizeWeather, validSeriesPayload, validWeatherPayload, fetchJson, weatherDescription } from '../src/providers.js';
const now = new Date('2026-11-23T15:00:00Z'), series = ECONOMIC_SERIES[0];
const weather = () => ({ current: { time: '2026-11-23T11:45', temperature_2m: 24, apparent_temperature: 25, relative_humidity_2m: 70, weather_code: 95 }, daily: { time: ['2026-11-23'], temperature_2m_min: [18], temperature_2m_max: [28], precipitation_probability_max: [80] } });
test('economic queries are date-bounded and do not request future observations', () => {
  const url = new URL(seriesUrl(series, now));
  assert.equal(url.searchParams.get('dataFinal'), '23/11/2026');
  assert.ok(url.searchParams.get('dataInicial')); assert.equal(url.searchParams.get('formato'), 'json');
});
test('descending, duplicate and future observations normalize correctly', () => {
  const rows = [{ data: '24/11/2026', valor: '999' }, { data: '23/11/2026', valor: '5.9' }, { data: '19/11/2026', valor: '5,8' }, { data: '19/11/2026', valor: '5.8' }];
  const data = normalizeSeries(rows, series, now);
  assert.deepEqual(data.history, [{ date: '2026-11-19', value: 5.8 }, { date: '2026-11-23', value: 5.9 }]);
  assert.ok(validSeriesPayload(data, series, now));
  assert.ok(!validSeriesPayload({ ...data, fetchedAt: '2026-11-24T15:00:00Z' }, series, now));
});
test('provider boundary rejects empty, conflicting, malformed and impossible values', () => {
  for (const rows of [[], {}, [{ data: '30/02/2026', valor: '1' }], [{ data: '23/11/2026', valor: '' }], [{ data: '23/11/2026', valor: 'Infinity' }], [{ data: '23/11/2026', valor: '-1' }], [{ data: '23/11/2026', valor: '1' }, { data: '23/11/2026', valor: '2' }]]) assert.throws(() => normalizeSeries(rows, series, now));
  const negativeInflation = normalizeSeries([{ data: '01/10/2026', valor: '-0.14' }], ECONOMIC_SERIES[5], now);
  assert.equal(negativeInflation.history[0].value, -.14);
});
test('weather keeps real provenance, handles WMO codes and rejects old observations', () => {
  const normalized = normalizeWeather(weather(), now);
  assert.equal(normalized.condition, 'Thunderstorms'); assert.equal(normalized.observedAt, '2026-11-23T14:45:00.000Z'); assert.equal(normalized.rain, 80);
  assert.ok(validWeatherPayload(normalized, now)); assert.ok(!validWeatherPayload(normalized, new Date('2026-11-24T15:00:00Z')));
  assert.equal(weatherDescription(123), 'Conditions unavailable');
  const bad = weather(); bad.current.temperature_2m = null; assert.throws(() => normalizeWeather(bad, now));
  const old = weather(); old.current.time = '2026-11-22T10:00'; assert.throws(() => normalizeWeather(old, now));
  const wrongDay = weather(); wrongDay.daily.time[0] = '2026-11-22'; assert.equal(normalizeWeather(wrongDay, now).min, null);
});
test('JSON fetch rejects HTTP errors, invalid JSON, oversized responses and timeouts', async () => {
  await assert.rejects(fetchJson('unused', { fetcher: async () => new Response('{}', { status: 500 }) }));
  await assert.rejects(fetchJson('unused', { fetcher: async () => new Response('not json') }));
  await assert.rejects(fetchJson('unused', { fetcher: async () => new Response('x'.repeat(1000001)) }));
  await assert.rejects(fetchJson('unused', { timeout: 5, fetcher: async (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))) }));
});

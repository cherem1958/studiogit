import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInContext, createContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import { parseHTML } from 'linkedom';
import { dayKey, TIME_ZONE, STORAGE_KEY } from '../src/core.js';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
async function boot({ saved, offline = false, protocol = 'file:' } = {}) {
  const { document, window } = parseHTML(html), storage = new Map(saved === undefined ? [] : [[STORAGE_KEY, saved]]);
  let clock = new Date('2026-11-23T15:00:00Z'), lastBlob;
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [+clock])); } static now() { return +clock; } }
  for (const select of document.querySelectorAll('select')) { let value = select.querySelector('option').value; Object.defineProperty(select, 'value', { get: () => value, set: v => value = v }); }
  for (const dialog of document.querySelectorAll('dialog')) { dialog.showModal = () => dialog.setAttribute('open', ''); dialog.close = () => dialog.removeAttribute('open'); }
  for (const input of document.querySelectorAll('input')) { input.setCustomValidity = () => {}; input.reportValidity = () => true; }
  document.getElementById('task-form').reset = () => {};
  const intervals = [], storageEvents = {};
  const browserWindow = { addEventListener: (name, callback) => { storageEvents[name] = callback; } };
  const context = createContext({ document, window: browserWindow, location: { protocol }, Date: Clock, Intl, Math, JSON, Set, Map, Number, String, Error, URLSearchParams, AbortController, Blob, crypto: webcrypto, console,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    setTimeout: () => 1, clearTimeout: () => {}, setInterval: (callback, ms) => { intervals.push({ callback, ms }); return 1; },
    URL: { createObjectURL: blob => { lastBlob = blob; return 'blob:test'; }, revokeObjectURL: () => {} },
    fetch: async url => {
      if (offline) throw new Error('offline');
      if (url.startsWith('/api/')) return new Response('Not found', { status: 404 });
      const value = url.includes('open-meteo') ? { current: { time: dayKey(clock) + 'T' + new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' }).format(clock), temperature_2m: 24, apparent_temperature: 25, relative_humidity_2m: 65, weather_code: 2 }, daily: { time: [dayKey(clock)], temperature_2m_min: [18], temperature_2m_max: [28], precipitation_probability_max: [30] } } : [{ data: '19/11/2026', valor: '5.8' }, { data: '23/11/2026', valor: '5.9' }];
      return new Response(JSON.stringify(value));
    }
  });
  runInContext(script, context);
  for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve));
  const get = id => document.getElementById(id), click = selector => document.querySelector(selector).dispatchEvent(new window.Event('click', { bubbles: true }));
  const submit = () => get('task-form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  const event = (element, name) => element.dispatchEvent(new window.Event(name, { bubbles: true }));
  return { document, window, storage, get, click, submit, event, context, blob: () => lastBlob, tick: date => { clock = new Date(date); intervals.find(i => i.ms === 1000).callback(); }, storageEvents };
}
test('standalone UI initializes all real-data views, validates local API fallback and source details', async () => {
  const app = await boot({ protocol: 'http:' });
  assert.equal(app.get('open-total').textContent, '04'); assert.equal(app.get('complete-total').textContent, '00');
  assert.equal(app.document.querySelectorAll('.indicator-card').length, 6); assert.equal(app.get('indicator-grid').getAttribute('aria-busy'), 'false');
  assert.ok(app.get('economy-status').textContent.startsWith('6 official series')); assert.equal(app.get('weather-value').textContent, '24°C');
  assert.equal(app.get('clock').textContent, '12:00'); assert.equal(app.get('edition-year').textContent, 'MMXXVI');
  app.click('.indicator-card'); assert.ok(app.get('data-dialog').hasAttribute('open')); assert.equal(app.document.querySelectorAll('.data-table tbody tr').length, 2);
  assert.ok(app.get('data-content').querySelector('a').href.includes('hdOidSeriesSelecionadas=1'));
  const ids = [...app.document.querySelectorAll('[id]')].map(element => element.id); assert.equal(new Set(ids).size, ids.length);
  for (const link of app.document.querySelectorAll('a[href^="#"]')) assert.ok(app.document.querySelector(link.getAttribute('href')), 'Valid anchor ' + link.getAttribute('href'));
});
test('task completion survives reload, resets its daily count at BH midnight, and never resets pending tasks', async () => {
  const app = await boot(); const checkbox = app.document.querySelector('.task-check'); checkbox.checked = true; app.event(checkbox, 'change');
  assert.equal(app.get('complete-total').textContent, '01'); assert.equal(app.get('open-total').textContent, '03');
  const reload = await boot({ saved: app.storage.get(STORAGE_KEY) }); assert.equal(reload.get('complete-total').textContent, '01');
  reload.tick('2026-11-24T03:00:00Z'); assert.equal(reload.get('complete-total').textContent, '00'); assert.equal(reload.get('open-total').textContent, '03'); assert.equal(reload.get('show-overdue').hidden, false);
});
test('add, edit, search, study planning, deletion undo and export work without HTML injection', async () => {
  const app = await boot(); app.click('#new-task'); app.get('task-input').value = '<img src=x onerror=alert(1)>'; app.get('task-area').value = 'personal'; app.submit();
  assert.equal(app.get('open-total').textContent, '05'); assert.equal(app.document.querySelectorAll('#task-list img').length, 0);
  app.get('task-search').value = '<img'; app.event(app.get('task-search'), 'input'); assert.equal(app.document.querySelectorAll('.task-row').length, 1);
  app.click('.task-actions button'); app.get('task-input').value = 'A refined action'; app.submit(); assert.ok(app.get('task-list').textContent.includes('A refined action'));
  app.get('task-search').value = 'refined'; app.event(app.get('task-search'), 'input'); app.click('.task-actions button:last-child'); assert.equal(app.get('open-total').textContent, '04'); app.click('#undo-action'); assert.equal(app.get('open-total').textContent, '05');
  app.click('.study-row:last-child button'); assert.equal(app.get('task-input').value, 'Practice C++ programming'); app.submit(); assert.equal(app.get('open-total').textContent, '06'); assert.equal(app.get('study-count-4').textContent, '1 planned');
  app.click('#export-tasks'); const backup = JSON.parse(await app.blob().text()); assert.equal(backup.version, 2); assert.equal(backup.tasks.length, 6);
});
test('corrupt storage is not overwritten and empty lists remain empty after reload', async () => {
  const bad = await boot({ saved: '{broken', offline: true }); assert.equal(bad.storage.get(STORAGE_KEY), '{broken'); assert.equal(bad.get('storage-notice').hidden, false); assert.equal(bad.get('open-total').textContent, '00');
  const empty = await boot({ saved: '[]', offline: true }); assert.equal(empty.get('open-total').textContent, '00'); assert.equal(empty.storage.get(STORAGE_KEY), '[]'); assert.equal(empty.get('weather-condition').textContent, 'Weather unavailable'); assert.equal(empty.get('economy-status').textContent, '0/6 available'); assert.ok(!empty.get('indicator-grid').textContent.includes('R$ '));
});
test('cross-tab updates and philosopher controls render without persisting provider data as tasks', async () => {
  const app = await boot(); const before = app.get('reflection-author').textContent; app.click('#next-reflection'); assert.notEqual(app.get('reflection-author').textContent, before);
  app.click('[data-thinker="0"]'); assert.equal(app.get('reflection-author').textContent, 'Aristotle');
  app.storageEvents.storage({ key: STORAGE_KEY, newValue: '[]' }); assert.equal(app.get('open-total').textContent, '00');
  app.storageEvents.storage({ key: STORAGE_KEY, newValue: '{broken' }); assert.equal(app.get('open-total').textContent, '00');
});
test('the import dialog validates the file and merges new tasks without replacing local edits', async () => {
  const app = await boot(), existing = JSON.parse(app.storage.get(STORAGE_KEY));
  const imported = [{ ...existing[0], title: 'Do not overwrite this local task' }, { ...existing[1], id: 'backup-new', title: 'Imported action' }];
  const input = app.get('import-file');
  Object.defineProperty(input, 'files', { configurable: true, value: [{ size: 1000, text: async () => JSON.stringify({ version: 1, tasks: imported }) }] });
  app.event(input, 'change'); await new Promise(resolve => setImmediate(resolve));
  assert.ok(app.get('import-dialog').hasAttribute('open')); assert.ok(app.get('import-summary').textContent.startsWith('1 new task'));
  app.click('#confirm-import'); const merged = JSON.parse(app.storage.get(STORAGE_KEY));
  assert.equal(merged.length, 5); assert.equal(merged[0].title, existing[0].title); assert.ok(merged.some(task => task.title === 'Imported action'));
  Object.defineProperty(input, 'files', { configurable: true, value: [{ size: 1000, text: async () => '{invalid' }] });
  app.event(input, 'change'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(JSON.parse(app.storage.get(STORAGE_KEY)).length, 5); assert.ok(app.get('toast-message').textContent.startsWith('Invalid backup'));
});

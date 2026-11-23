import { TIME_ZONE, STORAGE_KEY, MAX_TASKS, STUDIES, REFLECTIONS, dayKey, validTask, cleanTask, parseTasks, mergeTasks, initialTasks, migrateTasks, visibleTasks, reflectionForDay, sparklinePoints } from './core.js';
import { ECONOMIC_SERIES, WEATHER_URL, seriesUrl, seriesSource, fetchJson, normalizeSeries, normalizeWeather, validSeriesPayload, validWeatherPayload } from './providers.js';

const byId = id => document.getElementById(id);
const areaNames = { bpo: 'Financial BPO', study: 'Studies', personal: 'Personal' };
const moneyIds = new Set(['usd', 'eur']);
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TIME_ZONE });
const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: TIME_ZONE });
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE });
const uid = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
const number = (value, digits = 2) => new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const formatDay = (date, monthly = false) => (monthly ? monthFormatter : dateFormatter).format(new Date(date + 'T12:00:00Z'));
function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
function svgIcon(name) { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), use = document.createElementNS(svg.namespaceURI, 'use'); svg.setAttribute('aria-hidden', 'true'); use.setAttribute('href', '#icon-' + name); svg.append(use); return svg; }
function externalLink(label, url) { const link = node('a', '', label); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; return link; }
function iconButton(name, label, callback) { const button = node('button', 'icon-button'); button.type = 'button'; button.setAttribute('aria-label', label); button.append(svgIcon(name)); button.addEventListener('click', callback); return button; }
let toastTimer, undoAction = null;
function dismissToast() { clearTimeout(toastTimer); byId('toast').hidden = true; undoAction = null; }
function notify(text, undo = null) {
  clearTimeout(toastTimer); undoAction = undo;
  byId('toast-message').textContent = text; byId('undo-action').hidden = !undo; byId('toast').hidden = false;
  toastTimer = setTimeout(dismissToast, undo ? 12000 : 6000);
}
byId('dismiss-toast').addEventListener('click', dismissToast);
byId('undo-action').addEventListener('click', () => { const action = undoAction; dismissToast(); action?.(); });
byId('toast').addEventListener('focusin', () => clearTimeout(toastTimer));
byId('toast').addEventListener('mouseenter', () => clearTimeout(toastTimer));
byId('toast').addEventListener('mouseleave', () => { if (!byId('toast').contains(document.activeElement)) toastTimer = setTimeout(dismissToast, 12000); });
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => byId(button.dataset.close).close());

let taskState, storageWritable = true, filter = 'pending', searchQuery = '', editingId = null, pendingImport = [], reflectionIndex = reflectionForDay();
function storageNotice(message, recovery = false) {
  const notice = byId('storage-notice'); notice.hidden = false; notice.replaceChildren(node('span', '', message));
  if (recovery) {
    const button = node('button', '', 'Save the displayed list instead');
    button.addEventListener('click', () => {
      try { const original = localStorage.getItem(STORAGE_KEY); if (original !== null) localStorage.setItem('scriptorium.tasks.recovery.' + Date.now(), original); localStorage.setItem(STORAGE_KEY, JSON.stringify(taskState)); storageWritable = true; notice.hidden = true; notify('Displayed tasks saved. Previous data preserved in browser recovery storage.'); }
      catch { notify('Storage is unavailable. Export a backup before closing.'); }
    });
    notice.append(button);
  }
}
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  taskState = saved === null ? migrateTasks(localStorage) : parseTasks(JSON.parse(saved));
} catch {
  taskState = []; storageWritable = false;
  storageNotice('Saved tasks could not be read. Your previous data has not been overwritten. Export any new tasks before closing, or choose to save the displayed list.', true);
}
function saveTasks() {
  if (!storageWritable) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(taskState)); }
  catch { storageNotice('The browser could not save your changes. Export your tasks before closing this page.'); }
}
function renderTasks() {
  const today = dayKey(), pending = taskState.filter(task => !task.done), overdue = pending.filter(task => task.date < today);
  const due = taskState.filter(task => task.date <= today), complete = due.filter(task => task.done).length;
  const completedToday = taskState.filter(task => task.done && task.completedOn === today).length;
  byId('open-total').textContent = String(pending.length).padStart(2, '0');
  byId('complete-total').textContent = String(completedToday).padStart(2, '0');
  const percent = due.length ? Math.round(complete / due.length * 100) : 0;
  byId('progress-fill').style.width = percent + '%'; byId('task-progress').setAttribute('aria-valuenow', percent);
  byId('completion-label').textContent = `${complete} of ${due.length} due tasks complete`;
  byId('show-overdue').hidden = !overdue.length; byId('show-overdue').textContent = `${overdue.length} overdue ↗`;
  byId('task-context').textContent = filter === 'done' ? 'Your completed tasks' : filter === 'overdue' ? 'Tasks carried forward — nothing is reset overnight' : filter === 'pending' ? 'Your open tasks, ordered by due date' : `Open tasks · ${areaNames[filter]}`;
  for (const button of document.querySelectorAll('[data-filter]')) { const active = button.dataset.filter === filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }
  const list = byId('task-list'), tasks = visibleTasks(taskState, { filter, query: searchQuery, today }); list.replaceChildren();
  if (!tasks.length) { const empty = node('li', 'empty-state'); empty.append(node('strong', '', searchQuery ? 'Nothing on this page.' : filter === 'done' ? 'Progress will find its place here.' : 'A little room to breathe.'), node('span', '', searchQuery ? 'Try another search or a different filter.' : filter === 'done' ? 'Complete a task to add it to this record.' : 'No tasks in this view. Choose your next deliberate step.')); list.append(empty); }
  for (const task of tasks) {
    const row = node('li', 'task-row' + (task.done ? ' done' : '')), checkbox = node('input', 'task-check'); checkbox.type = 'checkbox'; checkbox.checked = task.done; checkbox.id = 'task-' + task.id; checkbox.setAttribute('aria-label', (task.done ? 'Reopen: ' : 'Complete: ') + task.title);
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      if (task.done) task.completedOn = dayKey(); else delete task.completedOn;
      saveTasks(); renderTasks(); notify(task.done ? 'One step completed.' : 'Task reopened.');
      (byId('task-list').querySelector('input') || byId('new-task')).focus({ preventScroll: true });
    });
    const content = node('div', 'task-main'), title = node('label', 'task-title', task.title); title.htmlFor = checkbox.id;
    const meta = node('div', 'task-meta'); meta.append(node('span', 'task-area ' + task.area, areaNames[task.area]));
    meta.append(node('span', !task.done && task.date < today ? 'overdue' : '', (task.date < today && !task.done ? 'Overdue · ' : '') + (task.date === today ? 'Today' : formatDay(task.date))));
    if (task.priority === 'high') meta.append(node('span', 'high', 'High priority'));
    content.append(title, meta); const actions = node('div', 'task-actions');
    actions.append(iconButton('edit', 'Edit: ' + task.title, () => openTask(task)), iconButton('trash', 'Delete: ' + task.title, () => {
      const removed = { ...task }; taskState = taskState.filter(item => item.id !== task.id); saveTasks(); renderTasks(); byId('new-task').focus({ preventScroll: true });
      notify('Task removed.', () => { if (!taskState.some(item => item.id === removed.id) && taskState.length < MAX_TASKS) { taskState.push(removed); saveTasks(); renderTasks(); notify('Task restored.'); } });
    }));
    row.append(checkbox, content, actions); list.append(row);
  }
  for (let i = 0; i < STUDIES.length; i++) {
    const open = pending.filter(task => task.area === 'study' && task.title === STUDIES[i].task).length;
    const label = byId('study-count-' + i); if (label) label.textContent = open ? `${open} planned` : 'Plan a session';
  }
}
function openTask(task = null, study = null) {
  editingId = task?.id || null; byId('task-form').reset();
  byId('task-dialog-title').textContent = task ? 'Refine the next step.' : 'Give it a place.';
  byId('save-task').textContent = task ? 'Save changes' : 'Add task';
  byId('task-input').setCustomValidity(''); byId('task-input').value = task?.title || study?.task || '';
  byId('task-area').value = task?.area || (study ? 'study' : 'bpo'); byId('task-date').value = task?.date || dayKey(); byId('task-priority').value = task?.priority || 'normal';
  byId('task-dialog').showModal(); byId('task-input').focus();
}
byId('new-task').addEventListener('click', () => openTask());
byId('task-input').addEventListener('input', () => byId('task-input').setCustomValidity(''));
byId('task-form').addEventListener('submit', event => {
  event.preventDefault(); const title = byId('task-input').value.trim();
  if (!title) { byId('task-input').setCustomValidity('Describe a clear action.'); byId('task-input').reportValidity(); return; }
  const existing = taskState.find(task => task.id === editingId);
  if (editingId && !existing) { notify('This task was removed in another tab. Create a new task instead.'); byId('task-dialog').close(); return; }
  if (!editingId && taskState.length >= MAX_TASKS) return notify('The 5,000-task limit has been reached. Export a backup and remove old tasks.');
  const task = { id: editingId || uid(), title, area: byId('task-area').value, date: byId('task-date').value, priority: byId('task-priority').value, done: existing?.done || false };
  if (!validTask(task)) return notify('Check the task title, area and date.');
  if (existing?.completedOn) task.completedOn = existing.completedOn;
  if (existing) taskState = taskState.map(item => item.id === task.id ? task : item); else taskState.push(task);
  filter = task.done ? 'done' : 'pending'; searchQuery = ''; byId('task-search').value = ''; saveTasks(); renderTasks(); byId('task-dialog').close(); notify(existing ? 'Task updated.' : 'A place made for the next step.');
});
for (const button of document.querySelectorAll('[data-filter]')) button.addEventListener('click', () => { filter = button.dataset.filter; renderTasks(); });
byId('show-overdue').addEventListener('click', () => { filter = 'overdue'; searchQuery = ''; byId('task-search').value = ''; renderTasks(); });
byId('task-search').addEventListener('input', event => { searchQuery = event.target.value; renderTasks(); });
byId('review-tasks').addEventListener('click', () => { filter = 'pending'; searchQuery = ''; byId('task-search').value = ''; renderTasks(); byId('tasks-title').focus({ preventScroll: true }); });
for (let i = 0; i < STUDIES.length; i++) {
  const study = STUDIES[i], row = node('div', 'study-row'), text = node('div', 'study-text'); text.append(node('b', '', study.name), node('small', '', study.kind));
  const count = node('span', 'study-count'); count.id = 'study-count-' + i;
  row.append(node('span', 'study-index', ['I', 'II', 'III', 'IV', 'V'][i]), text, count, iconButton('plus', 'Plan a study session: ' + study.name, () => openTask(null, study))); byId('study-grid').append(row);
}
function renderReflection() {
  const reflection = REFLECTIONS[reflectionIndex];
  byId('reflection-text').textContent = reflection.text; byId('reflection-author').textContent = reflection.name; byId('reflection-topic').textContent = reflection.topic; byId('reflection-prompt').textContent = reflection.prompt;
  byId('author-monogram').textContent = reflection.name.replace(/^St\. /, '').split(' ').map(word => word[0]).slice(0, 2).join('');
  for (const button of document.querySelectorAll('[data-thinker]')) button.setAttribute('aria-pressed', String(Number(button.dataset.thinker) === reflectionIndex));
}
REFLECTIONS.forEach((reflection, i) => { const button = node('button'); button.dataset.thinker = i; button.setAttribute('aria-label', 'Read a reflection inspired by ' + reflection.name); button.addEventListener('click', () => { reflectionIndex = i; renderReflection(); }); byId('reflection-pagination').append(button); });
byId('next-reflection').addEventListener('click', () => { reflectionIndex = (reflectionIndex + 1) % REFLECTIONS.length; renderReflection(); });
byId('export-tasks').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'scriptorium', version: 2, exportedAt: new Date().toISOString(), tasks: taskState }, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), link = node('a');
  link.href = url; link.download = 'scriptorium-tasks-' + dayKey() + '.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Backup exported. Keep it somewhere safe.');
});
byId('import-tasks').addEventListener('click', () => byId('import-file').click());
byId('import-file').addEventListener('change', async () => {
  const input = byId('import-file'), file = input.files[0]; if (!file) return;
  try {
    if (file.size > 2000000) throw new Error('File too large');
    const value = JSON.parse(await file.text()); if (![1, 2].includes(value.version)) throw new Error('Unknown backup format');
    pendingImport = parseTasks(value.tasks); const merged = mergeTasks(taskState, pendingImport), added = merged.length - taskState.length;
    byId('import-summary').textContent = `${added} new task${added === 1 ? '' : 's'} will be added. ${pendingImport.length - added} existing task${pendingImport.length - added === 1 ? '' : 's'} will be kept as they are.`; byId('import-dialog').showModal();
  } catch { notify('Invalid backup. Choose a Scriptorium or Essencial task export, up to 2 MB.'); }
  input.value = '';
});
byId('confirm-import').addEventListener('click', () => {
  try { taskState = mergeTasks(taskState, pendingImport); pendingImport = []; saveTasks(); filter = 'pending'; renderTasks(); byId('import-dialog').close(); notify('Tasks imported.'); }
  catch { byId('import-dialog').close(); notify('Import exceeds the task limit. No tasks were changed.'); }
});
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  try { taskState = event.newValue === null ? [] : parseTasks(JSON.parse(event.newValue)); renderTasks(); notify('Tasks updated from another tab.'); }
  catch { notify('Another tab saved unreadable data. Your current list has been kept.'); }
});

// Source values are validated at the boundary, and remain distinguishable from cached observations.
const DATA_KEY = 'scriptorium.economy.v1', WEATHER_KEY = 'scriptorium.weather.v1';
const economyState = new Map(); let weatherState = null, economyFlight = null, weatherFlight = null, lastEconomyAttempt = 0, lastWeatherAttempt = 0;
const withinDays = data => data && Date.now() - Date.parse(data.fetchedAt) < 7 * 86400000;
function readCache(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
function saveCache(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Tasks remain usable when provider caching is unavailable. */ } }
const cachedEconomy = readCache(DATA_KEY);
for (const series of ECONOMIC_SERIES) { const cached = cachedEconomy?.[series.id]; economyState.set(series.id, { id: series.id, data: validSeriesPayload(cached, series) && withinDays(cached) ? cached : null, status: 'cached' }); }
const cachedWeather = readCache(WEATHER_KEY); if (validWeatherPayload(cachedWeather)) weatherState = { data: cachedWeather, status: 'cached' };
function ageOf(date) { return Math.floor((Date.parse(dayKey() + 'T12:00:00Z') - Date.parse(date + 'T12:00:00Z')) / 86400000); }
function renderEconomy() {
  const grid = byId('indicator-grid'); grid.replaceChildren(); let available = 0, cached = 0;
  for (const series of ECONOMIC_SERIES) {
    const record = economyState.get(series.id), data = record?.data, card = node('button', 'indicator-card'); card.type = 'button';
    card.setAttribute('aria-label', 'View ' + series.name + ' details and source');
    const header = node('span', 'indicator-top'); header.append(node('span', 'indicator-name', series.name), node('span', '', '↗')); card.append(header);
    if (data && withinDays(data) && validSeriesPayload(data, series)) {
      available++; if (record.status !== 'ok') cached++;
      const latest = data.history.at(-1), previous = data.history.at(-2), isMoney = moneyIds.has(series.id);
      card.append(node('span', 'indicator-value', (isMoney ? 'R$ ' : '') + number(latest.value, series.digits) + (isMoney ? '' : '%')), node('span', 'indicator-unit', series.unit));
      let change = 'No previous observation';
      if (previous) { const delta = isMoney ? (latest.value / previous.value - 1) * 100 : latest.value - previous.value; change = (delta > 0 ? '+' : '') + number(delta) + (isMoney ? '%' : ' pp') + ' vs previous'; }
      card.append(node('span', 'indicator-change', change));
      const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); chart.setAttribute('class', 'indicator-chart'); chart.setAttribute('viewBox', '0 0 150 32'); chart.setAttribute('preserveAspectRatio', 'none'); chart.setAttribute('aria-hidden', 'true');
      const line = document.createElementNS(chart.namespaceURI, 'polyline'); line.setAttribute('points', sparklinePoints(data.history.map(p => p.value))); line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'currentColor'); chart.append(line); card.append(chart);
      card.append(node('span', 'indicator-date', 'As of ' + formatDay(latest.date, series.frequency === 'monthly')));
      const old = ageOf(latest.date) > (series.frequency === 'monthly' ? 75 : 7);
      card.append(node('span', 'indicator-state' + (record.status !== 'ok' ? ' cached' : old ? ' old' : ''), record.status !== 'ok' ? 'Cached · refresh pending' : old ? 'Older observation · inspect source' : 'Checked ' + timeFormatter.format(new Date(data.fetchedAt)) + ' BRT'));
    } else {
      card.append(node('span', 'indicator-value unavailable', economyFlight ? 'Checking…' : 'Unavailable'), node('span', 'indicator-unit', series.unit), node('span', 'indicator-change', 'No verified observation'), node('span', 'indicator-date', series.frequency === 'monthly' ? 'Monthly publication' : 'Daily series'), node('span', 'indicator-state', 'Select for source details'));
    }
    card.addEventListener('click', () => showIndicator(series)); grid.append(card);
  }
  byId('economy-status').textContent = economyFlight ? 'Checking official sources…' : available === 6 && !cached ? '6 official series · checked automatically' : `${available}/6 available${cached ? ' · ' + cached + ' cached' : ''}`;
  grid.setAttribute('aria-busy', String(!!economyFlight));
}
function showIndicator(series) {
  const record = economyState.get(series.id), data = validSeriesPayload(record?.data, series) && withinDays(record.data) ? record.data : null, content = byId('data-content'); byId('data-title').textContent = series.name; content.replaceChildren(node('p', '', series.description));
  const metadata = node('dl', 'data-metadata');
  const details = [['Source', series.origin + ' · SGS ' + series.code], ['Unit', series.unit], ['Publication', series.frequency === 'monthly' ? 'Monthly' : 'Daily / business-day observations'], ['Last successful check', data ? dateFormatter.format(new Date(data.fetchedAt)) + ' · ' + timeFormatter.format(new Date(data.fetchedAt)) + ' BRT' : 'No verified data'], ['Data status', record?.status === 'ok' ? 'Successfully checked' : data ? 'Cached; latest refresh not verified' : 'Unavailable']];
  for (const [label, value] of details) { const wrapper = node('div'); wrapper.append(node('dt', '', label), node('dd', '', value)); metadata.append(wrapper); }
  content.append(metadata, externalLink('Open official series ↗', seriesSource(series)));
  if (data) {
    const table = node('table', 'data-table'), caption = node('caption', '', 'Latest published observations · dates in Belo Horizonte time'), head = node('thead'), hr = node('tr'); hr.append(node('th', '', 'Reference'), node('th', '', series.unit)); head.append(hr); const body = node('tbody');
    for (const point of [...data.history].reverse()) { const row = node('tr'); row.append(node('td', '', formatDay(point.date, series.frequency === 'monthly')), node('td', '', number(point.value, series.digits))); body.append(row); }
    table.append(caption, head, body); content.append(table);
  }
  byId('data-dialog').showModal();
}
async function obtainEconomy() {
  if (location.protocol !== 'file:') {
    try { const payload = await fetchJson('/api/economy'); if (!Array.isArray(payload.items) || payload.items.length !== ECONOMIC_SERIES.length) throw new Error('Invalid backend response'); return payload.items; } catch { /* Static hosts and direct files can read the same public APIs. */ }
  }
  return Promise.all(ECONOMIC_SERIES.map(async series => {
    try { return { id: series.id, status: 'ok', data: normalizeSeries(await fetchJson(seriesUrl(series)), series) }; }
    catch { return { id: series.id, status: 'unavailable', data: null }; }
  }));
}
function refreshEconomy(force = false) {
  if (economyFlight) return economyFlight;
  if (!force && Date.now() - lastEconomyAttempt < 5 * 60000) return Promise.resolve();
  const fresh = ECONOMIC_SERIES.every(series => { const value = economyState.get(series.id); return value?.status === 'ok' && value.data && Date.now() - Date.parse(value.data.fetchedAt) < 3600000; });
  if (!force && fresh) return Promise.resolve();
  lastEconomyAttempt = Date.now(); byId('refresh-economy').disabled = true;
  economyFlight = (async () => {
    try {
      const incoming = await obtainEconomy();
      for (const series of ECONOMIC_SERIES) {
        const record = incoming.find(item => item?.id === series.id), previous = economyState.get(series.id)?.data;
        if (record && ['ok', 'cached'].includes(record.status) && validSeriesPayload(record.data, series) && withinDays(record.data)) economyState.set(series.id, { id: series.id, status: record.status, data: record.data });
        else economyState.set(series.id, { id: series.id, status: 'cached', data: previous && validSeriesPayload(previous, series) && withinDays(previous) ? previous : null });
      }
      saveCache(DATA_KEY, Object.fromEntries([...economyState].filter(([, record]) => record.data).map(([id, record]) => [id, record.data])));
    } catch { for (const record of economyState.values()) record.status = 'cached'; }
    finally { economyFlight = null; byId('refresh-economy').disabled = false; renderEconomy(); }
  })();
  renderEconomy(); return economyFlight;
}
function renderWeather() {
  const data = weatherState?.data;
  if (validWeatherPayload(data)) {
    byId('weather-value').textContent = number(data.temperature, 0) + '°C'; byId('weather-condition').textContent = data.condition;
    const facts = []; if (data.min !== null && data.max !== null) facts.push(`${number(data.min, 0)}° / ${number(data.max, 0)}°`); if (data.rain !== null) facts.push(`${number(data.rain, 0)}% rain chance`);
    byId('weather-range').textContent = facts.join(' · ') || 'Belo Horizonte, Brazil';
    const observation = new Date(data.observedAt), previousDay = dayKey(observation) !== dayKey();
    byId('weather-status').textContent = `${weatherState.status === 'cached' ? 'Cached · ' : ''}Observed ${previousDay ? dateFormatter.format(observation) + ' ' : ''}${timeFormatter.format(observation)} BRT`;
  } else {
    byId('weather-value').textContent = '—'; byId('weather-condition').textContent = weatherFlight ? 'Checking the sky' : 'Weather unavailable'; byId('weather-range').textContent = 'Belo Horizonte, Brazil'; byId('weather-status').textContent = weatherFlight ? 'Requesting observations' : 'No recent verified observation';
  }
}
function refreshWeather(force = false) {
  if (weatherFlight) return weatherFlight;
  if (!force && Date.now() - lastWeatherAttempt < 5 * 60000) return Promise.resolve();
  if (!force && weatherState?.status === 'ok' && validWeatherPayload(weatherState.data) && Date.now() - Date.parse(weatherState.data.fetchedAt) < 15 * 60000) return Promise.resolve();
  lastWeatherAttempt = Date.now(); byId('refresh-weather').disabled = true;
  weatherFlight = (async () => {
    try {
      let record;
      if (location.protocol !== 'file:') { try { record = await fetchJson('/api/weather'); if (!record || !['ok', 'cached', 'unavailable'].includes(record.status)) throw new Error('Invalid backend'); } catch { record = null; } }
      if (!record) record = { status: 'ok', data: normalizeWeather(await fetchJson(WEATHER_URL)) };
      if (!['ok', 'cached'].includes(record.status) || !validWeatherPayload(record.data)) throw new Error('Weather unavailable');
      weatherState = record; saveCache(WEATHER_KEY, record.data);
    } catch { if (weatherState) weatherState.status = 'cached'; }
    finally { weatherFlight = null; byId('refresh-weather').disabled = false; renderWeather(); }
  })();
  renderWeather(); return weatherFlight;
}
byId('refresh-economy').addEventListener('click', () => refreshEconomy(true)); byId('refresh-weather').addEventListener('click', () => refreshWeather(true)); byId('open-methodology').addEventListener('click', () => byId('methodology-dialog').showModal());
let lastDay = '', lastMinute = '';
function updateClock() {
  const now = new Date(), today = dayKey(now), minute = timeFormatter.format(now);
  if (minute !== lastMinute) { byId('clock').textContent = minute; byId('clock').dateTime = now.toISOString(); lastMinute = minute; }
  if (today !== lastDay) {
    let year = Number(today.slice(0, 4));
    byId('edition-year').textContent = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].map(([value, numeral]) => { const part = numeral.repeat(Math.floor(year / value)); year %= value; return part; }).join('');
    byId('date-label').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    if (lastDay) { reflectionIndex = reflectionForDay(today); renderReflection(); void refreshEconomy(true); }
    lastDay = today; renderTasks();
  }
}
function resume() { updateClock(); renderEconomy(); renderWeather(); if (!document.hidden) { void refreshEconomy(); void refreshWeather(); } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) resume(); }); window.addEventListener('focus', resume); window.addEventListener('online', () => { void refreshEconomy(true); void refreshWeather(true); });
saveTasks(); renderReflection(); updateClock(); renderEconomy(); renderWeather(); void refreshEconomy(); void refreshWeather();
setInterval(() => { if (!document.hidden) updateClock(); }, 1000);
setInterval(() => { if (!document.hidden) resume(); }, 60000);

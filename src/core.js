export const TIME_ZONE = 'America/Sao_Paulo';
export const STORAGE_KEY = 'scriptorium.tasks.v2';
export const MAX_TASKS = 5000;
export const STUDIES = [
  { name: 'Ancord & CPA', kind: 'Financial certifications', task: 'Review Ancord & CPA material' },
  { name: 'Introduction to Aristotle', kind: 'Classical philosophy', task: 'Study Introduction to Aristotle' },
  { name: 'Confessions', kind: 'St. Augustine · Reading', task: 'Read Confessions by St. Augustine' },
  { name: 'Calculus II', kind: 'Mathematics', task: 'Practice Calculus II problems' },
  { name: 'C++', kind: 'Programming', task: 'Practice C++ programming' }
];
export const REFLECTIONS = [
  { name: 'Aristotle', topic: 'Character & habit', text: 'Let the life you hope to live take shape in the actions you choose to repeat.', prompt: 'Which small action is worth repeating today?' },
  { name: 'St. Thomas Aquinas', topic: 'Prudence & action', text: 'Before deciding what ought to be done, give patient attention to what is.', prompt: 'What fact deserves a closer look before you act?' },
  { name: 'St. Anselm', topic: 'Faith seeking understanding', text: 'Return to what you believe, with enough patience to understand it more deeply.', prompt: 'What question would make your reading more attentive?' },
  { name: 'Søren Kierkegaard', topic: 'Choice & responsibility', text: 'A day takes its shape when possibility becomes a choice you are willing to make.', prompt: 'Which decision have you left suspended in possibility?' },
  { name: 'Olavo de Carvalho', topic: 'Intellectual life & attention', text: 'Examine what you know through experience, and what you have merely learned to repeat.', prompt: 'What can you honestly say you have understood for yourself?' },
  { name: 'Wolfgang Smith', topic: 'Meaning & contemplation', text: 'Attend to what can be measured, without forgetting to ask what it means.', prompt: 'What matters in your work beyond the numbers?' }
];
export function dayKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year', 'month', 'day'].map(key => parts.find(p => p.type === key).value).join('-');
}
export function validDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2199-12-31') return false;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}
export function validTask(task) {
  return !!task && typeof task.id === 'string' && /^[\w-]{1,100}$/.test(task.id) && typeof task.title === 'string' && !!task.title.trim() && task.title.length <= 180 && ['bpo', 'study', 'personal'].includes(task.area) && ['normal', 'high'].includes(task.priority) && typeof task.done === 'boolean' && validDay(task.date) && (task.completedOn === undefined || task.done && validDay(task.completedOn));
}
export function cleanTask(task) { return { id: task.id, title: task.title.trim(), area: task.area, priority: task.priority, date: task.date, done: task.done, ...(task.completedOn ? { completedOn: task.completedOn } : {}) }; }
export function parseTasks(value) {
  if (!Array.isArray(value) || value.length > MAX_TASKS || !value.every(validTask) || new Set(value.map(task => task.id)).size !== value.length) throw new Error('Invalid task data');
  return value.map(cleanTask);
}
export function mergeTasks(local, incoming) {
  const ids = new Set(local.map(task => task.id));
  return parseTasks([...local, ...parseTasks(incoming).filter(task => !ids.has(task.id))]);
}
export function initialTasks(today = dayKey()) {
  return [
    { title: 'Complete bank reconciliations', area: 'bpo', priority: 'high' },
    { title: 'Update the balance dashboard', area: 'bpo', priority: 'normal' },
    { title: 'Analyze financial reports', area: 'bpo', priority: 'normal' },
    { title: 'Review Ancord & CPA material', area: 'study', priority: 'normal' }
  ].map((task, index) => ({ ...task, id: 'initial-' + index, date: today, done: false }));
}
export function visibleTasks(tasks, { filter = 'pending', query = '', today = dayKey() } = {}) {
  const search = query.trim().toLocaleLowerCase('en');
  return tasks.filter(task => (filter === 'done' ? task.done : !task.done && (filter === 'pending' || filter === task.area || filter === 'overdue' && task.date < today)) && (!search || task.title.toLocaleLowerCase('en').includes(search)))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1) || a.title.localeCompare(b.title, 'en'));
}
export function migrateTasks(storage, today = dayKey()) {
  const previous = storage.getItem('essencial.tasks.v1');
  if (previous !== null) {
    const translations = { 'Realizar conciliações bancárias': 'Complete bank reconciliations', 'Atualizar o painel de saldos': 'Update the balance dashboard', 'Analisar relatórios financeiros': 'Analyze financial reports', 'Revisar conteúdos de Ancord e CPA': 'Review Ancord & CPA material' };
    return parseTasks(JSON.parse(previous)).map(task => ({ ...task, title: translations[task.title] || task.title }));
  }
  const legacy = storage.getItem('systemic_bpo_task_matrix_items_v2');
  if (legacy !== null) {
    const value = JSON.parse(legacy);
    if (!Array.isArray(value)) throw new Error('Invalid legacy tasks');
    return parseTasks(value.map(task => ({ id: String(task.id), title: task.title, done: task.completed === true, area: 'bpo', priority: task.priority === 'high' ? 'high' : 'normal', date: today })));
  }
  return initialTasks(today);
}
export function reflectionForDay(today = dayKey()) { return Math.floor(Date.parse(today + 'T12:00:00Z') / 86400000) % REFLECTIONS.length; }
export function sparklinePoints(values, width = 150, height = 32) {
  if (values.length < 2 || !values.every(Number.isFinite)) return '';
  const min = Math.min(...values), max = Math.max(...values), span = max - min;
  return values.map((value, index) => `${(index / (values.length - 1) * width).toFixed(2)},${(span ? height - 3 - (value - min) / span * (height - 6) : height / 2).toFixed(2)}`).join(' ');
}

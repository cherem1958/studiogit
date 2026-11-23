import test from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, validDay, validTask, parseTasks, mergeTasks, initialTasks, visibleTasks, migrateTasks, reflectionForDay, sparklinePoints } from '../src/core.js';
const today = '2026-11-23';
test('Belo Horizonte midnight is independent of the host timezone', () => {
  assert.equal(dayKey(new Date('2026-11-24T02:59:59Z')), today);
  assert.equal(dayKey(new Date('2026-11-24T03:00:00Z')), '2026-11-24');
  assert.ok(validDay('2024-02-29')); assert.ok(!validDay('2026-02-29')); assert.ok(!validDay('2026-02-30')); assert.ok(!validDay('2026-13-01'));
});
test('task validation preserves completion dates, rejects invalid and duplicate records', () => {
  const task = { ...initialTasks(today)[0], done: true, completedOn: today };
  assert.deepEqual(parseTasks([task]), [task]);
  assert.ok(!validTask({ ...task, title: '  ' })); assert.ok(!validTask({ ...task, done: false })); assert.ok(!validTask({ ...task, completedOn: '2026-02-30' }));
  assert.throws(() => parseTasks([task, task])); assert.throws(() => parseTasks([null]));
  assert.deepEqual(parseTasks([]), []);
});
test('merge preserves local edits and rejects over-limit imports atomically', () => {
  const tasks = initialTasks(today), incoming = [{ ...tasks[0], title: 'Remote edit' }, { ...tasks[1], id: 'new' }];
  assert.equal(mergeTasks(tasks, incoming).length, 5);
  assert.equal(mergeTasks(tasks, incoming)[0].title, tasks[0].title);
  assert.throws(() => mergeTasks(tasks, Array.from({ length: 5000 }, (_, i) => ({ ...tasks[0], id: 'new-' + i }))));
});
test('filters and search retain overdue tasks across day changes', () => {
  const tasks = initialTasks(today); tasks[1].date = '2026-11-22'; tasks[2].done = true;
  assert.equal(visibleTasks(tasks, { filter: 'overdue', today }).length, 1);
  assert.equal(visibleTasks(tasks, { filter: 'pending', today })[0].id, tasks[1].id);
  assert.equal(visibleTasks(tasks, { filter: 'pending', today, query: '  ANCORD ' }).length, 1);
  assert.equal(visibleTasks(tasks, { filter: 'done', today }).length, 1);
  assert.equal(visibleTasks(tasks, { filter: 'overdue', today: '2026-11-24' }).length, 3);
});
test('migration preserves empty old lists, translates known defaults and keeps custom content', () => {
  assert.deepEqual(migrateTasks({ getItem: key => key === 'essencial.tasks.v1' ? '[]' : null }, today), []);
  const old = [{ ...initialTasks(today)[0], title: 'Realizar conciliações bancárias' }];
  assert.equal(migrateTasks({ getItem: key => key === 'essencial.tasks.v1' ? JSON.stringify(old) : null }, today)[0].title, 'Complete bank reconciliations');
  assert.throws(() => migrateTasks({ getItem: () => '{broken' }));
});
test('daily reflections are deterministic; flat and missing charts never produce NaN', () => {
  assert.equal(reflectionForDay(today), reflectionForDay(today));
  assert.notEqual(reflectionForDay(today), reflectionForDay('2026-11-24'));
  assert.equal(sparklinePoints([1]), ''); assert.equal(sparklinePoints([1, NaN]), '');
  assert.equal(sparklinePoints([5, 5]), '0.00,16.00 150.00,16.00');
});

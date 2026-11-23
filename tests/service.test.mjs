import test from 'node:test';
import assert from 'node:assert/strict';
import { createDataService } from '../lib/data-service.mjs';
test('concurrent clients share one fetch per series, and fresh caches avoid repeat calls', async () => {
  let calls = 0;
  const service = createDataService({ now: () => new Date('2026-11-23T15:00:00Z'), fetcher: async () => { calls++; await new Promise(r => setTimeout(r, 5)); return new Response('[{"data":"19/11/2026","valor":"5.8"}]'); } });
  const [first, second] = await Promise.all([service.economy(), service.economy()]);
  assert.equal(calls, 6); assert.deepEqual(first, second); assert.ok(first.items.every(item => item.status === 'ok'));
  await service.economy(); assert.equal(calls, 6);
});
test('partial failure, retry cooldown, stale preservation, recovery and seven-day expiry', async () => {
  let clock = new Date('2026-11-23T15:00:00Z'), fail = false, calls = 0;
  const service = createDataService({ now: () => clock, fetcher: async () => { calls++; if (fail) throw new Error('network'); return new Response('[{"data":"19/11/2026","valor":"5.8"}]'); } });
  const first = await service.economy(); const fetchedAt = first.items[0].data.fetchedAt;
  clock = new Date(+clock + 3600001); fail = true;
  const failed = await service.economy(); assert.ok(failed.items.every(item => item.status === 'cached')); assert.equal(failed.items[0].data.fetchedAt, fetchedAt);
  const before = calls; await service.economy(); assert.equal(calls, before);
  clock = new Date(+clock + 5 * 60000); fail = false; assert.ok((await service.economy()).items.every(item => item.status === 'ok'));
  clock = new Date(+clock + 8 * 86400000); fail = true; assert.ok((await service.economy()).items.every(item => item.status === 'unavailable' && item.data === null));
});
test('one failed series does not suppress successful indicators; restore validates data', async () => {
  const service = createDataService({ now: () => new Date('2026-11-23T15:00:00Z'), fetcher: async url => { if (url.includes('sgs.1/')) throw new Error('down'); return new Response('[{"data":"19/11/2026","valor":"5.8"}]'); } });
  service.restore({ usd: { id: 'usd', history: [{ date: '2099-01-01', value: 100 }], fetchedAt: '2026-11-23T15:00:00Z' } });
  const result = await service.economy(); assert.equal(result.items[0].status, 'unavailable'); assert.equal(result.items.filter(i => i.status === 'ok').length, 5);
});

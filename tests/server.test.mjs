import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server.mjs';
test('HTTP serves only the site and known APIs, with caching, CSP and safe methods', async t => {
  const service = { economy: async () => ({ items: [] }), weather: async () => ({ status: 'unavailable', data: null }) };
  const server = await createApp({ service }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base), html = await response.text();
  assert.equal(response.status, 200); assert.ok(html.includes('<html lang="en">')); assert.ok(response.headers.get('content-security-policy').includes("script-src 'sha256-")); assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(html.includes('<meta name="scriptorium-api" content="enabled">'));
  assert.equal((await fetch(base, { headers: { 'If-None-Match': response.headers.get('etag') } })).status, 304);
  const head = await fetch(base, { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
  for (const path of ['/.git/config', '/.env', '/src/app.js', '/%2e%2e/server.mjs', '/api/unknown']) assert.equal((await fetch(base + path)).status, 404);
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  assert.deepEqual(await (await fetch(base + '/api/weather')).json(), { status: 'unavailable', data: null });
  assert.equal((await (await fetch(base + '/api/health')).json()).status, 'ok');
});

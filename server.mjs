import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { createDataService } from './lib/data-service.mjs';

const root = dirname(fileURLToPath(import.meta.url));
export async function createApp({ service = createDataService(), indexPath = join(root, 'index.html') } = {}) {
  const html = await readFile(indexPath), compressed = gzipSync(html);
  const digest = createHash('sha256').update(html).digest('hex');
  const script = html.toString().match(/<script>([\s\S]*?)<\/script>/)?.[1] || '';
  const scriptHash = createHash('sha256').update(script).digest('base64');
  const security = {
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': `default-src 'none'; script-src 'sha256-${scriptHash}'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.bcb.gov.br https://api.open-meteo.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`
  };
  const server = createServer(async (req, res) => {
    for (const [key, value] of Object.entries(security)) res.setHeader(key, value);
    const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(req.method === 'HEAD' ? undefined : JSON.stringify(value)); };
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return json(405, { error: 'Method not allowed' }); }
    let path;
    try { path = new URL(req.url, 'http://localhost').pathname; } catch { return json(400, { error: 'Invalid URL' }); }
    try {
      if (path === '/api/economy') return json(200, await service.economy());
      if (path === '/api/weather') return json(200, await service.weather());
      if (path === '/api/health') return json(200, { status: 'ok', service: 'scriptorium', time: new Date().toISOString() });
      if (path !== '/' && path !== '/index.html') return json(404, { error: 'Not found' });
      const etag = '"' + digest + '"';
      res.setHeader('ETag', etag); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Vary', 'Accept-Encoding');
      if (req.headers['if-none-match'] === etag) { res.writeHead(304); return res.end(); }
      const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
      if (gzip) res.setHeader('Content-Encoding', 'gzip');
      const body = gzip ? compressed : html;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': body.length });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { json(503, { error: 'Data temporarily unavailable' }); }
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000; server.keepAliveTimeout = 5000;
  return server;
}

async function start() {
  const cachePath = join(root, '.cache', 'providers.json');
  let saveTimer, saveChain = Promise.resolve();
  const service = createDataService({ onChange() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const snapshot = JSON.stringify(service.snapshot());
      saveChain = saveChain.then(async () => { await mkdir(dirname(cachePath), { recursive: true }); await writeFile(cachePath + '.tmp', snapshot); await rename(cachePath + '.tmp', cachePath); }).catch(() => console.warn('Provider cache could not be saved.'));
    }, 150);
  } });
  try { const data = await readFile(cachePath, 'utf8'); if (data.length < 1000000) service.restore(JSON.parse(data)); } catch { /* First start or unusable cache: fetch real data. */ }
  const server = await createApp({ service });
  const port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  server.on('error', error => { console.error('Server could not start:', error.message); process.exitCode = 1; });
  server.listen(port, host, () => {
    console.log(`Scriptorium is ready: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log('Economic data: checked hourly. Weather: checked every 15 minutes. No API keys required.');
    const update = () => { void service.economy(); void service.weather(); };
    update();
    const interval = setInterval(update, 60000); interval.unref();
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { clearInterval(interval); clearTimeout(saveTimer); server.close(() => process.exit()); setTimeout(() => process.exit(), 2000).unref(); });
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) start().catch(error => { console.error(error.message); process.exitCode = 1; });

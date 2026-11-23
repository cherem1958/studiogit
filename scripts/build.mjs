import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFile(resolve(root, name), 'utf8');
const [template, css, ...modules] = await Promise.all(['src/template.html', 'src/styles.css', 'src/core.js', 'src/providers.js', 'src/app.js'].map(read));
const code = modules.map(source => source.replace(/^import .*?;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
new Script(code);
if (/<\/script/i.test(code) || /<\/style/i.test(css)) throw new Error('Unsafe inline closing tag');
const html = template.replace('/* STYLES */', () => css.trim()).replace('/* APPLICATION */', () => "'use strict';\n(() => {\n" + code.trim() + '\n})();');
if (process.argv.includes('--check')) {
  if (await read('index.html') !== html) throw new Error('index.html is out of date. Run npm run build.');
  console.log('Build verified: index.html matches its sources.');
} else {
  await writeFile(resolve(root, 'index.html'), html);
  const copy = process.argv.find(arg => arg.startsWith('--copy='));
  if (copy) await writeFile(resolve(root, copy.slice(7)), html);
  console.log(`Built self-contained index.html (${Buffer.byteLength(html)} bytes).`);
}

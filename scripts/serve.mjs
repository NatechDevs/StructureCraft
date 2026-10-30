import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const production = process.argv.includes('--production');
const root = production ? resolve(project, 'dist') : project;
const port = Number(process.env.PORT || 8080);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
if (production) await stat(resolve(root, 'index.html')).catch(() => { throw new Error('Run npm run build before preview.'); });
const productionHeaders = production ? Object.fromEntries(JSON.parse(await readFile(resolve(project, 'vercel.json'), 'utf8')).headers[0].headers.map(header => [header.key, header.value])) : {};

createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path === '/index.php' || path === '/aaindex.html') { response.writeHead(302, { ...productionHeaders, Location: '/' }); response.end(); return; }
    const normalized = path === '/' ? 'index.html' : path === '/docs' ? 'docs.html' : path === '/workspace' ? 'workspace.html' : path.slice(1);
    // Serve only public routes. Never expose project metadata or source tooling.
    if (!['index.html', 'workspace.html', 'docs.html', '404.html', 'robots.txt', 'LICENSE', 'THIRD_PARTY_NOTICES.md'].includes(normalized) && !normalized.startsWith('assets/')) throw new Error('Not found');
    const target = resolve(root, normalized);
    if (!target.startsWith(root + sep) || normalized.split('/').some(part => part.startsWith('.'))) throw new Error('Not found');
    const contents = await readFile(target);
    response.writeHead(200, { ...productionHeaders, 'Content-Type': (normalized === 'LICENSE' ? 'text/plain; charset=utf-8' : types[extname(target)]) || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    response.end(contents);
  } catch {
    response.writeHead(404, { ...productionHeaders, 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await readFile(resolve(root, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, '127.0.0.1', () => console.log(`StructureCraft ${production ? 'production preview' : 'development'}: http://localhost:${port}`));

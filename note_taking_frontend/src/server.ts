import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { withSafeConsole, safeToString } from './app/core/utils/logging.util';

withSafeConsole();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

// Basic JSON parsing for potential mock endpoints
app.use(express.json());

// Minimal mock API to allow frontend to function if no backend is connected.
// In real deployment, set NG_APP_API_BASE_URL to your backend and disable these mocks.
const mockNotes = [
  { id: '1', title: 'Welcome', content: 'This is your secure notes app.', categoryId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: true },
  { id: '2', title: 'Ocean Professional', content: 'Use blue primary and amber accents.', categoryId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: false },
];
const mockCategories = [
  { id: 'c1', name: 'Personal', color: '#2563EB', count: 1 },
  { id: 'c2', name: 'Work', color: '#F59E0B', count: 0 },
];
let idCounter = 3;

app.get('/api/notes', (req, res) => {
  const query: Record<string, unknown> = req.query as any;
  const q = String(query['q'] ?? '').toLowerCase();
  const categoryId = (query['categoryId'] as string) || null;
  let data = [...mockNotes];
  if (categoryId) data = data.filter(n => n.categoryId === categoryId);
  if (q) data = data.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
  return res.json(data);
});
app.post('/api/notes', (req, res) => {
  const now = new Date().toISOString();
  const n = { id: String(idCounter++), title: req.body.title || 'Untitled', content: req.body.content || '', categoryId: req.body.categoryId || null, createdAt: now, updatedAt: now, pinned: false };
  mockNotes.unshift(n);
  return res.status(201).json(n);
});
app.put('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  const idx = mockNotes.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).end();
  mockNotes[idx] = { ...mockNotes[idx], ...req.body, updatedAt: new Date().toISOString() };
  return res.json(mockNotes[idx]);
});
app.patch('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  const idx = mockNotes.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).end();
  mockNotes[idx] = { ...mockNotes[idx], ...req.body, updatedAt: new Date().toISOString() };
  return res.json(mockNotes[idx]);
});
app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  const idx = mockNotes.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).end();
  mockNotes.splice(idx, 1);
  return res.status(204).end();
});

app.get('/api/categories', (_req, res) => res.json(mockCategories));
app.post('/api/categories', (req, res) => {
  const c = { id: `c${mockCategories.length + 1}`, name: req.body.name, color: req.body.color || '#2563EB', count: 0 };
  mockCategories.push(c);
  res.status(201).json(c);
});
app.delete('/api/categories/:id', (req, res) => {
  const id = req.params.id;
  const idx = mockCategories.findIndex(c => c.id === id);
  if (idx === -1) {
    res.status(404).end();
    return;
  }
  mockCategories.splice(idx, 1);
  res.status(204).end();
});

app.get('/api/user/me', (_req, res) => res.json({ id: 'u1', name: 'Alex Doe', email: 'alex@example.com' }));
app.post('/api/user/logout', (_req, res) => res.status(204).end());

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Global Express error handler to ensure safe string logging and responses.
 */
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const safeToString = (e: unknown): string => {
    if (typeof e === 'string') return e;
    if (e instanceof Error) return e.stack || e.message || String(e);
    try { return JSON.stringify(e); } catch { return String(e); }
  };
  const message = safeToString(err);
  // Log as string to avoid passing undefined to Node internals
  console.error(message);
  res.status(500).send('Internal Server Error');
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;

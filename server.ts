import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  handleHealth,
  handleLeads,
  handleAnalyzeAi,
  handleDiscoverIdeas,
} from './src/server/apiHandlers';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  const portFromArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : NaN;
  const PORT = !isNaN(portFromArg) ? portFromArg : (Number(process.env.PORT) || 3000);
  const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

  app.use(express.json({ limit: '10mb' }));

  // API Routes delegating to shared handlers (exact parity with Vercel serverless functions)
  app.all('/api/health', (req, res) => handleHealth(req, res));
  app.all('/api/leads', (req, res) => handleLeads(req, res));
  app.all('/api/analyze-ai', (req, res) => handleAnalyzeAi(req, res));
  app.all('/api/discover-ideas', (req, res) => handleDiscoverIdeas(req, res));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const frontendDist = path.resolve(process.cwd(), 'dist');
    app.use(express.static(frontendDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(frontendDist, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

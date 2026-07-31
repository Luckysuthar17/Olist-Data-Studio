import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest } from './src/utils/apiEngine';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Proxy Handler
  app.all('/api/v1/*', (req: Request, res: Response) => {
    const method = req.method as 'GET' | 'POST';
    const endpoint = req.path;
    const queryParams = (req.query as Record<string, string>) || {};
    const bodyParams = req.body || {};

    const apiRes = handleApiRequest(method, endpoint, queryParams, bodyParams);
    if (apiRes) {
      res.status(apiRes.statusCode).json(apiRes);
    } else {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'API Endpoint not found' });
    }
  });

  // Serve Vite in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


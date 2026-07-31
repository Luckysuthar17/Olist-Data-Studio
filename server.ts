import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './src/utils/apiEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Proxy Handler
app.all('/api/v1/*', (req: Request, res: Response) => {
  const method = req.method as 'GET' | 'POST';
  const endpoint = req.path;
  const queryParams = (req.query as Record<string, string>) || {};
  const bodyParams = req.body || {};

  const apiRes = handleApiRequest(method, endpoint, queryParams, bodyParams);
  res.status(apiRes.statusCode).json(apiRes);
});

// Serve Vite build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Olist Analytics & FastAPI Server running on port ${PORT}`);
});

import express, { Request, Response } from 'express';
import { handleApiRequest } from '../src/utils/apiEngine';

const app = express();

app.use(express.json());

app.all('*', (req: Request, res: Response) => {
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

export default app;

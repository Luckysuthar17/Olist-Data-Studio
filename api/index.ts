import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApiRequest } from '../src/utils/apiEngine';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const method = (req.method || 'GET') as 'GET' | 'POST';
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const endpoint = url.pathname;

  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const bodyParams = typeof req.body === 'object' && req.body !== null ? req.body : {};

  const apiRes = handleApiRequest(method, endpoint, queryParams, bodyParams);
  res.status(apiRes.statusCode).json(apiRes);
}

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { handleApiRequest, getAnalystInsights } from './src/utils/apiEngine';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Dedicated AI Data Analyst endpoint
  app.post('/api/v1/analyze', async (req: Request, res: Response) => {
    const prompt = req.body?.prompt || (req.query?.prompt as string) || 'Give an executive overview of the Olist dataset';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Analyze the user's query for the Olist E-Commerce dataset: "${prompt}".
Dataset context: 350 orders, R$ 56,840 GMV, SP (41%), RJ (18%), MG (11.5%) top states, 72.4% credit card payments, delivery delays strongly correlate with review score drops (4.6 vs 1.9 stars), high freight burden on bulky categories. Provide specific, tailored findings and actionable recommendations for this exact query.`,
          config: {
            systemInstruction: 'You are an expert E-Commerce Data Analyst for the Brazilian Olist marketplace dataset. Return a structured JSON object.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                replyText: { type: Type.STRING },
                findings: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['replyText', 'findings', 'recommendations'],
            },
          },
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          return res.json({
            status: 'success',
            statusCode: 200,
            timestamp: new Date().toISOString(),
            endpoint: '/api/v1/analyze',
            method: 'POST',
            data: parsed,
          });
        }
      } catch (e) {
        console.error('Server Gemini API Error:', e);
      }
    }

    // Fallback to local intelligent analytical engine
    const insights = getAnalystInsights(prompt);
    return res.json({
      status: 'success',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      endpoint: '/api/v1/analyze',
      method: 'POST',
      data: insights,
    });
  });

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


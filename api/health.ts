import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);
  res.status(200).json({ status: 'ok', hasApiKey, platform: 'vercel-serverless' });
}

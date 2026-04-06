import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const KV_KEY = 'bni:weekly-report';

function verifyApiKey(req: VercelRequest): boolean {
  const apiKey = req.headers['x-api-key'];
  return !!process.env.API_SECRET_KEY && apiKey === process.env.API_SECRET_KEY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  if (req.method === 'GET') {
    const data = await redis.get(KV_KEY);
    return res.status(200).json(data || null);
  }

  if (req.method === 'POST') {
    if (!verifyApiKey(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redis.set(KV_KEY, req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

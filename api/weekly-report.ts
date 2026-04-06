import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const KV_KEY = 'bni:weekly-report';

function verifyAccess(req: VercelRequest): boolean {
  const key = req.headers['x-api-key'] as string;
  const { API_SECRET_KEY, API_READ_KEY } = process.env;
  if (API_SECRET_KEY && key === API_SECRET_KEY) return true;
  if (API_READ_KEY && key === API_READ_KEY) return true;
  return false;
}

function verifyWrite(req: VercelRequest): boolean {
  const key = req.headers['x-api-key'] as string;
  return !!process.env.API_SECRET_KEY && key === process.env.API_SECRET_KEY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAccess(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  if (req.method === 'GET') {
    const data = await redis.get(KV_KEY);
    return res.status(200).json(data || null);
  }

  if (req.method === 'POST') {
    if (!verifyWrite(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await redis.set(KV_KEY, req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

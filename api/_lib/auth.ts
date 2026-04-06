import type { VercelRequest } from '@vercel/node';

export function verifyApiKey(req: VercelRequest): boolean {
  const apiKey = req.headers['x-api-key'];
  const secretKey = process.env.API_SECRET_KEY;
  if (!secretKey) return false;
  return apiKey === secretKey;
}

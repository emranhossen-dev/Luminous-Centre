import type { NextRequest } from 'next/server';

/** Public origin for bKash callbackURL (must be reachable from the internet in real tests; use ngrok locally). */
export function getPublicBaseUrl(req: NextRequest): string {
  const fromEnv = process.env.APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  if (host) return `${proto}://${host}`;

  return 'http://localhost:3000';
}

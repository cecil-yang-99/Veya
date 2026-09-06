import type { Request } from 'express';

/**
 * Extracts a Bearer token from the Authorization header.
 * Returns null when the header is missing or malformed.
 */
export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

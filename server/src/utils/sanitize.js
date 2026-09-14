/**
 * Input sanitization middleware for TravelEase Express server.
 * Protects against NoSQL injection (strips keys starting with $ or containing .)
 * and sanitizes input strings across req.body, req.query, and req.params.
 */

export function sanitize(input) {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) {
    return input.map(sanitize);
  }
  const clean = Object.create(null);
  for (const [key, value] of Object.entries(input)) {
    // Block Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn(`[Security Alert] Stripped prototype pollution key: ${key}`);
      continue;
    }
    // Block MongoDB injection keys
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[Security Alert] Stripped potentially malicious key: ${key}`);
      continue;
    }
    if (typeof value === 'string') {
      // Strip dangerous characters and trim (control chars explicitly filtered for sanitization)
      // eslint-disable-next-line no-control-regex
      clean[key] = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export function sanitizeMiddleware(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitize(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitize(req.params);
  }
  next();
}

export default sanitizeMiddleware;

import { Context, Next } from 'hono';

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export const rateLimiter = (options = { limit: 10, windowMs: 60000 }) => {
  return async (c: Context, next: Next) => {
    // In Hono + Node, IP can be tricky to get, but we'll try standard headers
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    
    const now = Date.now();
    
    if (!store[ip]) {
      store[ip] = { count: 1, resetTime: now + options.windowMs };
    } else {
      if (now > store[ip].resetTime) {
        // Reset window
        store[ip] = { count: 1, resetTime: now + options.windowMs };
      } else {
        store[ip].count++;
        if (store[ip].count > options.limit) {
          return c.json({ error: 'Too many requests, please try again later.' }, 429);
        }
      }
    }
    
    // Set headers
    c.header('X-RateLimit-Limit', options.limit.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, options.limit - store[ip].count).toString());
    c.header('X-RateLimit-Reset', Math.ceil(store[ip].resetTime / 1000).toString());

    await next();
  };
};

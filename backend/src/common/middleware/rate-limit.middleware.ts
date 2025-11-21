import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 100; // 100 requests per minute

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Clean up old entries
    this.cleanup(now);

    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      // New window
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return next();
    }

    if (record.count >= this.maxRequests) {
      return res.status(429).json({
        statusCode: 429,
        message: 'Too many requests, please try again later.',
        timestamp: new Date().toISOString(),
      });
    }

    record.count++;
    next();
  }

  private cleanup(now: number) {
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}


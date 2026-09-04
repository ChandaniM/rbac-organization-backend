import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * REQUEST DEDUPLICATION UTILITY
 * 
 * System Design Concept: Request Coalescing/Deduplication
 * 
 * Problem: Multiple identical requests arrive simultaneously
 * Solution: Process only ONE request, share result with all callers
 * 
 * Example:
 * - 5 users click "Refresh Dashboard" at same time
 * - Without deduplication: 5 DB queries
 * - With deduplication: 1 DB query, 5 responses from same result
 */

interface PendingRequest {
  promise: Promise<any>;
  resolvers: Array<(data: any) => void>;
  rejectors: Array<(error: any) => void>;
  createdAt: number;
}

class RequestDeduplicationService {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  /**
   * Generate unique key for request
   * Combines: method, path, query params, user ID, tenant ID
   */
  private generateRequestKey(req: Request): string {
    const user = req.user as any;
    const userId = user?.userId || user?.id || 'anonymous';
    const tenantId = user?.tenantId || req.params.tenantId || 'no-tenant';
    
    const keyData = {
      method: req.method,
      path: req.path,
      query: JSON.stringify(req.query),
      userId,
      tenantId,
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');
  }

  /**
   * Clean up expired pending requests
   */
  private cleanupExpired(): void {
    const now = Date.now();
    
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.createdAt > this.REQUEST_TIMEOUT) {
        pending.rejectors.forEach(reject => 
          reject(new Error('Request deduplication timeout'))
        );
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Execute function with deduplication
   * If identical request is in-flight, wait for its result
   * Otherwise, execute and share result with concurrent requests
   */
  async deduplicate<T>(
    key: string,
    executor: () => Promise<T>
  ): Promise<T> {
    this.cleanupExpired();

    const pending = this.pendingRequests.get(key);
    
    if (pending) {
      console.log(`[Deduplication] Request merged: ${key.substring(0, 16)}...`);
      
      return new Promise((resolve, reject) => {
        pending.resolvers.push(resolve);
        pending.rejectors.push(reject);
      });
    }

    console.log(`[Deduplication] New request: ${key.substring(0, 16)}...`);

    const resolvers: Array<(data: any) => void> = [];
    const rejectors: Array<(error: any) => void> = [];

    const promise = (async () => {
      try {
        const result = await executor();
        
        resolvers.forEach(resolve => resolve(result));
        
        this.pendingRequests.delete(key);
        
        return result;
      } catch (error) {
        rejectors.forEach(reject => reject(error));
        
        this.pendingRequests.delete(key);
        
        throw error;
      }
    })();

    this.pendingRequests.set(key, {
      promise,
      resolvers,
      rejectors,
      createdAt: Date.now(),
    });

    return promise;
  }

  /**
   * Get statistics about current deduplication state
   */
  getStats() {
    this.cleanupExpired();
    
    return {
      pendingRequests: this.pendingRequests.size,
      requests: Array.from(this.pendingRequests.entries()).map(([key, pending]) => ({
        key: key.substring(0, 16),
        waitingCallers: pending.resolvers.length,
        age: Date.now() - pending.createdAt,
      })),
    };
  }
}

export const requestDeduplication = new RequestDeduplicationService();

/**
 * Express middleware for automatic request deduplication
 * Apply to GET endpoints that are expensive and cacheable
 */
export const deduplicateMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only deduplicate GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = crypto
      .createHash('sha256')
      .update(`${req.method}:${req.path}:${JSON.stringify(req.query)}:${(req.user as any)?.userId}`)
      .digest('hex');

    const originalJson = res.json.bind(res);
    let captured = false;
    let capturedData: any;

    res.json = function (data: any) {
      if (!captured) {
        capturedData = data;
        captured = true;
      }
      return originalJson(data);
    };

    try {
      await requestDeduplication.deduplicate(key, async () => {
        return new Promise((resolve) => {
          const originalNext = next;
          
          next = function () {
            originalNext();
          };

          res.on('finish', () => {
            resolve(capturedData);
          });

          next();
        });
      });
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Function decorator for service-level deduplication
 */
export function deduplicate(options?: { keyGenerator?: (...args: any[]) => string }) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = options?.keyGenerator 
        ? options.keyGenerator(...args)
        : `${propertyKey}:${JSON.stringify(args)}`;

      return requestDeduplication.deduplicate(key, () => 
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}

export default requestDeduplication;

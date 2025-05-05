
/**
 * Secure in-memory cache with automatic expiration
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class SecureCacheImpl {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: number | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

  constructor() {
    this.cache = new Map();
  }

  init(): void {
    if (this.cleanupInterval === null) {
      this.cleanupInterval = window.setInterval(() => {
        this.cleanExpiredEntries();
      }, this.CLEANUP_INTERVAL_MS);
    }
  }

  stop(): void {
    if (this.cleanupInterval !== null) {
      window.clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Export as singleton
export const SecureCache = new SecureCacheImpl();

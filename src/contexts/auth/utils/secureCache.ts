
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

// Browser storage with auto-expiration
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expires: number;
}

/**
 * A secure browser cache with expiration
 */
export class SecureCache {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Initialize the cache with automatic cleanup
   * @param cleanupIntervalMs Interval in ms for cleaning expired items
   */
  static init(cleanupIntervalMs = 5 * 60 * 1000): void {
    // Clean up on initialization
    this.cleanup();
    
    // Set up periodic cleanup
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }
  
  /**
   * Stop the automatic cleanup
   */
  static stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Store a value in session storage with TTL
   * @param key Storage key
   * @param value Value to store
   * @param ttl Time to live in milliseconds
   */
  static set<T>(key: string, value: T, ttl = this.DEFAULT_TTL): void {
    try {
      const secureKey = this.getSecureKey(key);
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        expires: Date.now() + ttl
      };
      
      sessionStorage.setItem(secureKey, JSON.stringify(item));
    } catch (error) {
      logAuth('SECURE-CACHE', `Error setting cache item: ${key}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
    }
  }
  
  /**
   * Get a value from session storage
   * @param key Storage key
   * @returns Stored value or null if expired/not found
   */
  static get<T>(key: string): T | null {
    try {
      const secureKey = this.getSecureKey(key);
      const json = sessionStorage.getItem(secureKey);
      
      if (!json) return null;
      
      const item: CacheItem<T> = JSON.parse(json);
      
      // Check if expired
      if (Date.now() > item.expires) {
        sessionStorage.removeItem(secureKey);
        return null;
      }
      
      return item.value;
    } catch (error) {
      logAuth('SECURE-CACHE', `Error getting cache item: ${key}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      return null;
    }
  }
  
  /**
   * Remove an item from the cache
   * @param key Storage key
   */
  static remove(key: string): void {
    try {
      const secureKey = this.getSecureKey(key);
      sessionStorage.removeItem(secureKey);
    } catch (error) {
      logAuth('SECURE-CACHE', `Error removing cache item: ${key}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
    }
  }
  
  /**
   * Clean up expired items
   */
  static cleanup(): void {
    try {
      const now = Date.now();
      let count = 0;
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key && key.startsWith('sc_')) {
          try {
            const json = sessionStorage.getItem(key);
            
            if (json) {
              const item: CacheItem<any> = JSON.parse(json);
              
              if (now > item.expires) {
                sessionStorage.removeItem(key);
                count++;
              }
            }
          } catch {
            // Skip invalid items
          }
        }
      }
      
      if (count > 0) {
        logAuth('SECURE-CACHE', `Cleaned up ${count} expired cache items`, {
          level: AUTH_LOG_LEVELS.INFO
        });
      }
    } catch (error) {
      logAuth('SECURE-CACHE', 'Error during cache cleanup', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
    }
  }
  
  /**
   * Get secure key by prefixing and obscuring the original key
   * @param key Original key
   * @returns Secure storage key
   */
  private static getSecureKey(key: string): string {
    return `sc_${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }
}

// Initialize the cache when module is imported
SecureCache.init();

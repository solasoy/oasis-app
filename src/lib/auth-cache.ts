import { type Session, type User } from '@supabase/supabase-js';

// Define the structure of cached authentication data
interface CachedAuthData {
  session: Session | null;
  user: User | null;
  adminStatus?: boolean;
  timestamp: number;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const authCache = new Map<string, CachedAuthData>();

/**
 * Generate a cache key based on the user's email and a specific context
 * @param email User's email
 * @param context Optional context to differentiate cache entries
 * @returns A unique cache key
 */
function generateCacheKey(email: string, context: string = 'default'): string {
  return `auth:${email.toLowerCase()}:${context}`;
}

/**
 * Get cached authentication data
 * @param email User's email
 * @param context Optional context to differentiate cache entries
 * @returns Cached authentication data or null if not found or expired
 */
export function getCachedAuth(email: string, context: string = 'default'): CachedAuthData | null {
  const cacheKey = generateCacheKey(email, context);
  const cached = authCache.get(cacheKey);
  
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    authCache.delete(cacheKey);
    return null;
  }
  
  return cached;
}

/**
 * Set cached authentication data
 * @param email User's email
 * @param data Authentication data to cache
 * @param context Optional context to differentiate cache entries
 */
export function setCachedAuth(
  email: string, 
  data: { 
    session: Session | null, 
    user: User | null, 
    adminStatus?: boolean 
  }, 
  context: string = 'default'
): void {
  const cacheKey = generateCacheKey(email, context);
  
  authCache.set(cacheKey, {
    ...data,
    timestamp: Date.now()
  });
}

/**
 * Clear cached authentication data for a specific user
 * @param email User's email
 * @param context Optional context to differentiate cache entries
 */
export function clearCachedAuth(email: string, context: string = 'default'): void {
  const cacheKey = generateCacheKey(email, context);
  authCache.delete(cacheKey);
}

/**
 * Clear all cached authentication data
 */
export function clearAllAuthCache(): void {
  authCache.clear();
}
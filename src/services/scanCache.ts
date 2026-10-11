import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';

/**
 * Computes a sanitized, user-specific storage key.
 * If no user is authenticated, falls back to guest storage.
 */
export function getUserStorageKey(userId?: string | null): string {
  if (!userId || userId === 'guest') {
    return 'truva_scanned_products_guest';
  }
  const safeId = userId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `truva_scanned_products_${safeId}`;
}

/**
 * Retrieves the cached scan products for the specified user.
 * - Demo accounts ('ins-officer-rajesh', 'demo-inspector-1') get default mock dossiers for SIH judging.
 * - Real authenticated accounts (e.g. Google OAuth or email sign-ins) start with an isolated empty history ([]).
 */
export function getCachedProducts(userId?: string | null): Product[] {
  const key = getUserStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Backward compatibility for legacy single-cache key (guest only)
    if (key === 'truva_scanned_products_guest') {
      const legacy = localStorage.getItem('truva_scanned_products_cache');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(key, legacy);
            return parsed;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('Error reading scan cache for user:', userId, e);
  }

  // Demo accounts can default to mock products for fast inspector judging/testing
  if (userId === 'ins-officer-rajesh' || userId === 'demo-inspector-1') {
    return MOCK_PRODUCTS;
  }

  // All genuine users / team members start with a completely fresh, isolated scan history!
  return [];
}

/**
 * Saves a new scanned product to the user's isolated scan cache.
 */
export function saveScannedProduct(product: Product, userId?: string | null): Product[] {
  const key = getUserStorageKey(userId);
  try {
    const current = getCachedProducts(userId);
    const updated = [
      product,
      ...current.filter((p) => p.id !== product.id && p.inspectionId !== product.inspectionId),
    ].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error saving scan cache for user:', userId, e);
    return [product];
  }
}

/**
 * Deletes a product from the user's isolated scan cache.
 */
export function deleteCachedProduct(id: string, userId?: string | null): Product[] {
  const key = getUserStorageKey(userId);
  try {
    const current = getCachedProducts(userId);
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error deleting cached product for user:', userId, e);
    return [];
  }
}

/**
 * Clears the user's scan cache from local storage.
 */
export function clearScanCache(userId?: string | null): Product[] {
  const key = getUserStorageKey(userId);
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Error clearing scan cache for user:', userId, e);
  }
  return [];
}

/**
 * Resets the user's cache to default mock products (e.g. on demand via "Reset Samples").
 */
export function resetCacheToDefaults(userId?: string | null): Product[] {
  const key = getUserStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(MOCK_PRODUCTS));
  } catch (e) {
    console.warn('Error resetting scan cache for user:', userId, e);
  }
  return MOCK_PRODUCTS;
}

/**
 * Returns cache size and item count statistics for the specific user.
 */
export function getCacheStats(userId?: string | null) {
  const key = getUserStorageKey(userId);
  const products = getCachedProducts(userId);
  let size = '0.0';
  try {
    const raw = localStorage.getItem(key) || '[]';
    size = (new Blob([raw]).size / 1024).toFixed(1);
  } catch (e) {
    console.warn('Error calculating cache stats:', e);
  }
  return {
    count: products.length,
    sizeKb: `${size} KB`,
    sizeKB: `${size} KB`,
    lastSync: 'Live LocalStorage Mirror',
    lastUpdated: 'Just now',
  };
}
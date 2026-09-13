import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const CACHE_KEY = 'truva_scanned_products_cache';

export function getCachedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading scan cache:', e);
  }
  return MOCK_PRODUCTS;
}

export function saveScannedProduct(product: Product): Product[] {
  try {
    const current = getCachedProducts();
    const updated = [product, ...current.filter((p) => p.id !== product.id)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error saving scan cache:', e);
    return [product];
  }
}

export function deleteCachedProduct(id: string): Product[] {
  try {
    const current = getCachedProducts();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error deleting cached product:', e);
    return [];
  }
}

export function clearScanCache(): Product[] {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.warn('Error clearing scan cache:', e);
  }
  return [];
}

export function resetCacheToDefaults(): Product[] {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(MOCK_PRODUCTS));
  } catch (e) {
    console.warn('Error resetting scan cache:', e);
  }
  return MOCK_PRODUCTS;
}

export function getCacheStats() {
  const products = getCachedProducts();
  const raw = localStorage.getItem(CACHE_KEY) || '[]';
  const size = (new Blob([raw]).size / 1024).toFixed(1);
  return {
    count: products.length,
    sizeKb: `${size} KB`,
    sizeKB: `${size} KB`,
    lastSync: 'Live LocalStorage Mirror',
    lastUpdated: 'Just now',
  };
}
/* Tiny stale-while-revalidate cache for the few queries that decide first paint
   (hero slides, categories). A returning visitor sees last visit's data at once
   while React Query refetches in the background. */
const CACHE_VERSION = 'v19';

// Immediate aggressive purge of all stale cache keys from previous versions (v1, v2, v3, v4, etc.)
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const staleKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('aurex_cache') || key.startsWith('v')) && !key.startsWith(`${CACHE_VERSION}_`)) {
        staleKeys.push(key);
      }
    }
    staleKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
  }
} catch {}

const read = (key) => {
  try {
    const raw = localStorage.getItem(`${CACHE_VERSION}_${key}`);
    if (!raw) return null;
    const hit = JSON.parse(raw);
    if (!hit || !hit.data) return null;
    if (Array.isArray(hit.data) && hit.data.length) return hit;
    if (typeof hit.data === "object" && hit.data !== null) return hit;
    return null;
  } catch {
    return null;
  }
};

/** Spread into useQuery options or use as placeholder provider. */
export const persisted = (key) => {
  const hit = read(key);
  return hit ? { initialData: hit.data, initialDataUpdatedAt: hit.at } : {};
};

/** Use as the tail of a queryFn: stores the result and passes it through. */
export const remember = (key) => (data) => {
  try {
    if (data) {
      if (Array.isArray(data) && data.length) {
        localStorage.setItem(`${CACHE_VERSION}_${key}`, JSON.stringify({ at: Date.now(), data }));
      } else if (typeof data === "object" && Object.keys(data).length) {
        localStorage.setItem(`${CACHE_VERSION}_${key}`, JSON.stringify({ at: Date.now(), data }));
      }
    }
  } catch { /* private mode / quota */ }
  return data;
};


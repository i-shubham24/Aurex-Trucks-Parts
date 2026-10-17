/* Tiny stale-while-revalidate cache for the few queries that decide first paint
   (hero slides, categories). A returning visitor sees last visit's data at once
   while React Query refetches in the background. */
const CACHE_VERSION = 'v4';

const read = (key) => {
  try {
    const raw = localStorage.getItem(`${CACHE_VERSION}_${key}`);
    if (!raw) {
      // Purge old stale cache keys from previous versions
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('aurex_cache_') && !k.startsWith(`${CACHE_VERSION}_`)) {
            localStorage.removeItem(k);
          }
        });
      } catch {}
      return null;
    }
    const hit = JSON.parse(raw);
    if (!hit || !hit.data) return null;
    if (Array.isArray(hit.data) && hit.data.length) return hit;
    if (typeof hit.data === "object" && hit.data !== null) return hit;
    return null;
  } catch {
    return null;
  }
};

/** Spread into useQuery options. */
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


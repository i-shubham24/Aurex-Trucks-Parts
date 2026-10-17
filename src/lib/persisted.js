/* Tiny stale-while-revalidate cache for the few queries that decide first paint
   (hero slides, categories). A returning visitor sees last visit's data at once
   while React Query refetches in the background. */
const read = (key) => {
  try {
    const hit = JSON.parse(localStorage.getItem(key));
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
        localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
      } else if (typeof data === "object" && Object.keys(data).length) {
        localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
      }
    }
  } catch { /* private mode / quota */ }
  return data;
};


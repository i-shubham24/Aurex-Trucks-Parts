/* Tiny stale-while-revalidate cache for the few queries that decide first paint
   (hero slides, categories). A returning visitor sees last visit's data at once
   while React Query refetches in the background. */
const read = (key) => {
  try {
    const hit = JSON.parse(localStorage.getItem(key));
    return hit && Array.isArray(hit.data) && hit.data.length ? hit : null;
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
    if (Array.isArray(data) && data.length) localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch { /* private mode / quota */ }
  return data;
};

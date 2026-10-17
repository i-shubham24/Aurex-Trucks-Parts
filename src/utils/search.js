const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Same rule the API applies to catalogue search: a short term has to start a word
   ("gl" must not hit "anGLe" or "sinGLe"), a longer one may match anywhere. */
export function makeMatcher(term) {
  const t = String(term || "").trim().toLowerCase();
  if (!t) return () => true;
  const words = t.split(/[\s,*]+/).filter(Boolean);
  if (words.length === 0) return () => true;

  const matchers = words.map((w) => {
    const body = escapeRegExp(w);
    return w.length < 3 ? new RegExp(`(^|[^a-z0-9])${body}`, "i") : new RegExp(body, "i");
  });

  return (text) => {
    const s = String(text || "");
    return matchers.every((rx) => rx.test(s));
  };
}

export default makeMatcher;

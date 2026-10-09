const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Same rule the API applies to catalogue search: a short term has to start a word
   ("gl" must not hit "anGLe" or "sinGLe"), a longer one may match anywhere. */
export function makeMatcher(term) {
  const t = String(term || "").trim().toLowerCase();
  if (!t) return () => true;
  const body = escapeRegExp(t);
  const rx = t.length < 4 ? new RegExp(`(^|[^a-z0-9])${body}`, "i") : new RegExp(body, "i");
  return (text) => rx.test(String(text || ""));
}

export default makeMatcher;

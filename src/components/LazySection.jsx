import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* Mounts its children only when the section is about to scroll into view, so
   below-the-fold blocks don't fetch data or decode images during first paint.
   The placeholder keeps the section's anchor id and a rough height, and a URL
   hash mounts everything straight away so #faq-style links still land. */
export default function LazySection({ children, id, minHeight = 360, rootMargin = "500px 0px" }) {
  const ref = useRef(null);
  const { hash } = useLocation();
  const [show, setShow] = useState(() => Boolean(hash) || typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (show) return;
    if (hash) { setShow(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setShow(true);
    }, { rootMargin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show, hash, rootMargin]);

  if (show) return children;
  return <div ref={ref} id={id} aria-hidden="true" style={{ minHeight }} />;
}

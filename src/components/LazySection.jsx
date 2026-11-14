import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* Mounts its children when the section is about to scroll into view,
   or automatically for search bots / after a brief delay so content
   is never hidden from crawlers and AI search engines. */
export default function LazySection({ children, id, minHeight = 360, rootMargin = "500px 0px" }) {
  const ref = useRef(null);
  const { hash } = useLocation();
  const isBotOrNoIO = typeof window === "undefined" ||
    typeof IntersectionObserver === "undefined" ||
    (typeof navigator !== "undefined" && /bot|crawler|spider|crawling|lighthouse|headless|google|bing|yandex|baidu|slurp|duckduckbot|facebookexternalhit|twitterbot/i.test(navigator.userAgent));

  const [show, setShow] = useState(() => Boolean(hash) || isBotOrNoIO);

  useEffect(() => {
    if (show) return;
    if (hash) { setShow(true); return; }

    // Fallback: auto-render after a brief moment so audit tools & AI answer engines never see empty containers
    const timer = setTimeout(() => setShow(true), 1000);

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setShow(true);
        clearTimeout(timer);
      }
    }, { rootMargin });
    if (ref.current) io.observe(ref.current);

    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [show, hash, rootMargin]);

  if (show) return children;
  return <div ref={ref} id={id} aria-hidden="true" style={{ minHeight }} />;
}

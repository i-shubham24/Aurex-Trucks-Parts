import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GearsOverlay } from "./GearsLoader.jsx";

const SHOW_MS = 2200;

export default function BootLoader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    // No loader inside the admin portal.
    if (window.location.pathname.startsWith("/admin")) {
      setGone(true);
      return;
    }
    const t = setTimeout(() => setLeaving(true), SHOW_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 400);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[100] bg-transparent"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <GearsOverlay />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

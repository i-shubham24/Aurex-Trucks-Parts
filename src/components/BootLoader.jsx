import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_SHOW = 1200;
const MAX_SHOW = 3600;

export default function BootLoader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const t0Ref = useRef(Date.now());

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const v = videoRef.current;
    if (v) {
      v.playbackRate = 1.25;
      v.play().catch(() => {});
    }
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      const wait = Math.max(0, MIN_SHOW - (Date.now() - t0Ref.current));
      setTimeout(() => setLeaving(true), wait);
    };
    const max = setTimeout(finish, MAX_SHOW);
    const vid = v;
    const onEnded = () => finish();
    vid?.addEventListener("ended", onEnded);
    return () => {
      clearTimeout(max);
      vid?.removeEventListener("ended", onEnded);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setGone(true);
      document.body.style.overflow = "";
    }, 550);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[100] grid place-items-center bg-[#1A1A2E]"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              src="/aurex-loader.mp4"
              className="h-full w-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

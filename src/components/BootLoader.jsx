import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_SHOW = 1200;
const MAX_SHOW = 9000;

export default function BootLoader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const t0Ref = useRef(Date.now());
  const soundOnRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    // No loader on mobile, compact screens, or admin portal.
    if (window.matchMedia?.("(max-width: 820px)").matches || window.location.pathname.startsWith('/admin')) {
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const v = videoRef.current;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      const wait = Math.max(0, MIN_SHOW - (Date.now() - t0Ref.current));
      setTimeout(() => setLeaving(true), wait);
    };

    // Sound on by default. Browsers block audible autoplay until the first
    // user gesture, so try unmuted immediately and also unmute on the first
    // pointer or key interaction anywhere on the page.
    const enableSound = () => {
      const el = videoRef.current;
      if (!el || soundOnRef.current) return;
      el.muted = false;
      el.play()
        .then(() => { soundOnRef.current = true; })
        .catch(() => { /* still blocked, retry on next gesture */ });
    };
    const trySound = async () => {
      if (!v) return;
      v.muted = false;
      try {
        await v.play();
        soundOnRef.current = true;
      } catch {
        v.muted = true;
        try { await v.play(); } catch { /* still blocked, splash covers */ }
        window.addEventListener("pointerdown", enableSound, { once: true });
        window.addEventListener("keydown", enableSound, { once: true });
      }
    };
    trySound();

    const max = setTimeout(finish, MAX_SHOW);
    const onPlaying = () => { t0Ref.current = Date.now(); setReady(true); };
    const onEnded = () => finish();
    const onError = () => setTimeout(finish, 800);
    v?.addEventListener("playing", onPlaying);
    v?.addEventListener("ended", onEnded);
    v?.addEventListener("error", onError);
    return () => {
      clearTimeout(max);
      v?.removeEventListener("playing", onPlaying);
      v?.removeEventListener("ended", onEnded);
      v?.removeEventListener("error", onError);
      window.removeEventListener("pointerdown", enableSound);
      window.removeEventListener("keydown", enableSound);
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
          className="fixed inset-0 z-[100] bg-[#1A1A2E]"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.video
            ref={videoRef}
            src="/aurex-loader.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            playsInline
            preload="auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const MIN_SHOW = 1200;
const MAX_SHOW = 9000;

export default function BootLoader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const t0Ref = useRef(Date.now());

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    // No loader on mobile and compact screens. Small screens go straight in.
    if (window.matchMedia?.("(max-width: 820px)").matches) {
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

    // Try with sound first. Browsers block audible autoplay, so fall
    // back to muted motion plus a tap for sound button.
    const trySound = async () => {
      if (!v) return;
      v.muted = false;
      try {
        await v.play();
        setMuted(false);
      } catch {
        v.muted = true;
        setMuted(true);
        setSoundBlocked(true);
        try { await v.play(); } catch { /* still blocked, splash covers */ }
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

  const unmute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().then(() => {
      setMuted(false);
      setSoundBlocked(false);
    }).catch(() => {});
  };

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
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-display font-black text-3xl tracking-wide text-white">AUREX</p>
              <p className="mt-1 text-[11px] font-black tracking-[0.3em] text-white/50 uppercase">Truck Parts Australia</p>
              <div className="mt-5 mx-auto w-40 h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/2 rounded-full bg-[#E53E00] animate-pulse" />
              </div>
            </div>
          </div>
          <motion.video
            ref={videoRef}
            src="/aurex-loader.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            preload="auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          {soundBlocked && ready && (
            <button
              onClick={unmute}
              className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur border border-white/15 px-4 py-2.5 text-[12px] font-bold text-white hover:border-[#E53E00] transition"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {muted ? "Tap for sound" : "Sound on"}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

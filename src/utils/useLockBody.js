import { useEffect } from "react";

/* Locks background page scroll + overscroll chaining while an overlay
   (drawer / modal / popup) is open. Restores on close/unmount. */
export default function useLockBody(active) {
  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [active]);
}

/**
 * Web Audio API synthesizer for crisp, studio-quality UI chimes.
 * Zero external audio files required, zero latency, runs offline.
 */

let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Check if sound is muted by user preference.
 */
export function isSoundMuted() {
  try {
    return localStorage.getItem("aurex_sound_muted") === "true";
  } catch {
    return false;
  }
}

/**
 * Toggle sound mute state. Returns new muted state.
 */
export function setSoundMuted(muted) {
  try {
    localStorage.setItem("aurex_sound_muted", muted ? "true" : "false");
  } catch {}
  return muted;
}

/**
 * Plays a warm, harmonic 3-tone success chime with natural exponential decay.
 * Frequencies: E5 (659.25Hz), G#5 (830.61Hz), B5 (987.77Hz), with an E6 (1318.5Hz) sparkle.
 */
export function playSuccessSound() {
  if (isSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic bell sequence: bright, pleasant, professional
    const chords = [
      { freq: 659.25, time: 0.00, dur: 0.35, gain: 0.18, type: "sine" },     // E5
      { freq: 830.61, time: 0.08, dur: 0.40, gain: 0.20, type: "sine" },     // G#5
      { freq: 987.77, time: 0.16, dur: 0.48, gain: 0.22, type: "sine" },     // B5
      { freq: 1318.51, time: 0.24, dur: 0.65, gain: 0.15, type: "triangle" } // E6 harmonic sparkle
    ];

    chords.forEach(({ freq, time, dur, gain, type }) => {
      const start = now + time;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, start);

      // Gentle attack and organic exponential decay to avoid any audio click
      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.linearRampToValueAtTime(gain, start + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  } catch (err) {
    // Graceful silent fallback
    console.debug("[audio] chime playback prevented:", err);
  }
}

/**
 * Plays a soft, subtle pop chime for minor positive actions.
 */
export function playSubtlePop() {
  if (isSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  } catch (err) {
    console.debug("[audio] pop playback prevented:", err);
  }
}

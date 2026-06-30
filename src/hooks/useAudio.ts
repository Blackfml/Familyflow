import { useCallback, useRef } from "react";

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: "task" | "notification" | "success" | "error" | "ai" = "notification") => {
    try {
      const ctx = getContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      const now = ctx.currentTime;

      switch (type) {
        case "task":
          oscillator.frequency.setValueAtTime(523.25, now);
          oscillator.frequency.setValueAtTime(659.25, now + 0.1);
          oscillator.frequency.setValueAtTime(783.99, now + 0.2);
          break;
        case "success":
          oscillator.frequency.setValueAtTime(523.25, now);
          oscillator.frequency.setValueAtTime(659.25, now + 0.12);
          break;
        case "error":
          oscillator.frequency.setValueAtTime(329.63, now);
          oscillator.frequency.setValueAtTime(261.63, now + 0.15);
          break;
        case "ai":
          oscillator.frequency.setValueAtTime(440, now);
          oscillator.frequency.setValueAtTime(659.25, now + 0.15);
          break;
        default:
          oscillator.frequency.setValueAtTime(440, now);
          oscillator.frequency.setValueAtTime(554.37, now + 0.08);
          oscillator.frequency.setValueAtTime(659.25, now + 0.16);
      }

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (e) {
      console.log("Audio feedback blocked:", e);
    }
  }, [getContext]);

  return { playSound };
}

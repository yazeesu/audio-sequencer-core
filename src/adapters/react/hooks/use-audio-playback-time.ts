import { useRef, useSyncExternalStore } from "react";
import { PlaybackEngine } from "@/src/core/playback/interfaces";

export function useAudioPlaybackTime(
  playbackEngine: PlaybackEngine,
  isPlaying: boolean,
): number {
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  return useSyncExternalStore(
    (onStoreChange) => {
      if (!playbackEngine || !isPlaying) return () => {};

      const tick = () => {
        timeRef.current = playbackEngine.getCurrentTime();
        onStoreChange();
        rafRef.current = requestAnimationFrame(tick);
      };

      timeRef.current = playbackEngine.getCurrentTime();
      let frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    },
    () => timeRef.current,
    () => 0,
  );
}

import { useRef, useSyncExternalStore } from "react";
import { MeasurableAudioPlayerEngine } from "@/src/audio/playback/core";

export function useAudioPlaybackTime(
  playbackEngineRef: MeasurableAudioPlayerEngine | null,
  isPlaying: boolean,
): number {
  const timeRef = useRef<number>(0);

  return useSyncExternalStore(
    (onStoreChange) => {
      if (!playbackEngineRef || !isPlaying) return () => {};

      const tick = () => {
        timeRef.current = playbackEngineRef.getCurrentTime();
        onStoreChange();
        timeRef.current = requestAnimationFrame(tick);
      };
      timeRef.current = playbackEngineRef.getCurrentTime();
      let frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    },
    () => timeRef.current,
    () => 0,
  );
}

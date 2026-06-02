import { SongData } from "@/src/shared/types";
import { useMachine } from "@xstate/react";
import { useEffect, useEffectEvent, useRef } from "react";
import { createPlaybackStateMachine } from "../utilities/create-playback-state-machine";
import {
  loadMIDIPlaybackSession,
  MIDIPlaybackSessionData,
  MIDIPlaybackSessionMetadata,
} from "../utilities/load-midi-playback-session";
import { MIDIPlaybackEngine } from "@/src/infrastructure/playback/midi/midi-playback-engine";
import { createMIDIPlaybackEngine } from "@/src/core/playback/factory";

export const midiPlaybackStateMachine = createPlaybackStateMachine<
  MIDIPlaybackEngine,
  MIDIPlaybackSessionMetadata,
  MIDIPlaybackSessionData
>();

export function useAudioPlaybackEngine(currentSong?: SongData) {
  const playbackEngineRef = useRef<MIDIPlaybackEngine | null>(null);

  const [state, send] = useMachine(midiPlaybackStateMachine, {
    input: {
      playbackEngineRef,
      createEngine: createMIDIPlaybackEngine,
      loadSession: loadMIDIPlaybackSession,
    },
  });

  const triggerLoad = useEffectEvent((song: SongData) => {
    send({ type: "LOAD", payload: { song } });
  });

  useEffect(() => {
    if (!currentSong) return;
    triggerLoad(currentSong);
    return () => {
      playbackEngineRef.current?.dispose();
    };
  }, [currentSong?.id]);

  const isPlaying = state.matches("PLAYING");
  const isPaused = state.matches("PAUSED");
  const isStopped = state.matches("READY");
  const isError = state.matches("ERROR");
  const isDisposed = state.matches("DISPOSED");
  const isIdle = state.matches("IDLE");
  const isLoading = state.matches("LOADING");
  const isReady = state.matches("READY");

  return {
    state,
    status: state.value,
    context: state.context,
    isPlaying,
    isPaused,
    isStopped,
    isError,
    isDisposed,
    isIdle,
    isLoading,
    isReady,
    playbackEngineRef,
    handlePlay: () => send({ type: "PLAY" }),
    handlePause: () => send({ type: "PAUSE" }),
    handleStop: () => send({ type: "STOP" }),
  };
}

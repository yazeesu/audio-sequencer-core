import { AudioPlayerEngine } from "@/src/audio/playback/core";
import { SongData } from "@/src/shared/types";
import { Midi } from "@tonejs/midi";
import { useMachine } from "@xstate/react";
import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { audioPlaybackEngineMachine } from "../context/audio-playback-machine";

export function useAudioPlaybackEngine(currentSong?: SongData) {
  const playbackEngineRef = useRef<AudioPlayerEngine<Midi> | null>(null);
  const [state, send] = useMachine(audioPlaybackEngineMachine, {
    input: {
      playbackEngineRef,
    },
  });

  const currentTrack = useMemo(() => {
    if (!playbackEngineRef.current) return null;
    return playbackEngineRef.current.getSource()?.tracks[
      state.context.currentTrackIndex ?? 0
    ];
  }, [state.context.currentTrackIndex]);

  const loadCurrentSong = useEffectEvent((song: SongData) => {
    send({ type: "LOAD", payload: { currentSong: song } });
  });

  useEffect(() => {
    if (!currentSong) return;
    loadCurrentSong(currentSong);
    return () => {
      playbackEngineRef.current?.dispose();
    };
  }, [currentSong?.id]);

  return {
    state,
    status: state.value,
    context: state.context,
    playbackEngineRef,
    currentTrack,
    handlePlay: () => send({ type: "PLAY" }),
    handlePause: () => send({ type: "PAUSE" }),
    handleStop: () => send({ type: "STOP" }),
    handleUpdateTrack: (trackIndex: number) =>
      send({ type: "UPDATE_CURRENT_TRACK", payload: { trackIndex } }),
  };
}

import { SynthBassInstrument } from "@/src/audio/instruments/synth-bass-guitar";
import { SynthRetroPianoInstrument } from "@/src/audio/instruments/synth-retro-piano";
import { AudioPlayerEngine } from "@/src/audio/playback/core";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine";
import { Midi } from "@tonejs/midi";
import { useMachine } from "@xstate/react";
import { useEffect, useMemo, useRef } from "react";
import { audioPlayerMachine } from "../context/audio-player-machine";

export type PlayableTrack = {
  id: number;
  name: string;
  instrument: {
    family: string;
    name: string;
  };
  notesLength: number;
};

/**
 * A hook that manages the state of the MIDI player. This function should be used in React components.
 *
 * @param source - The source of the MIDI file to play.
 * @returns The state of the MIDI player and the functions to play, stop, and pause the MIDI file.
 */
export function useMIDIPlayer(source: string) {
  const engineRef = useRef<AudioPlayerEngine<Midi> | null>(null);
  if (!engineRef.current) {
    engineRef.current = new MIDIPlaybackEngine();
    (engineRef.current as MIDIPlaybackEngine).registerInstrument(
      "piano__bright acoustic piano",
      new SynthRetroPianoInstrument(),
    );
    (engineRef.current as MIDIPlaybackEngine).registerInstrument(
      "bass__electric bass (finger)",
      new SynthBassInstrument(),
    );
  }

  const [state, send] = useMachine(audioPlayerMachine, {
    input: {
      engineRef,
      source,
    },
  });

  const playableTracks = useMemo<PlayableTrack[]>(() => {
    if (["idle", "loading"].includes(state.value)) return [];
    if (!engineRef.current?.getSource()) return [];
    const tracks = engineRef.current
      ?.getSource()
      ?.tracks.map((track, index) => ({
        id: index,
        name: track.name,
        instrument: {
          family: track.instrument.family,
          name: track.instrument.name,
        },
        notesLength: track.notes.length,
      }));

    /**
     * TODO: Change this to a dynamic value.
     */
    const MINIMUM_NOTE_LENGTH = 25;
    return (
      tracks?.filter((track) => track.notesLength > MINIMUM_NOTE_LENGTH) ?? []
    );
  }, [state.value]);

  return {
    engineRef,
    state,
    playableTracks,
    handlePlay: () => send({ type: "PLAY" }),
    handleStop: () => send({ type: "STOP" }),
    handlePause: () => send({ type: "PAUSE" }),
  };
}

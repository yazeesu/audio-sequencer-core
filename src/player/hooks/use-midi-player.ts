import { SynthBassInstrument } from "@/src/audio/instruments/synth-bass-guitar";
import { AudioPlayerEngine } from "@/src/audio/playback/core";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine";
import { Midi } from "@tonejs/midi";
import { useMachine } from "@xstate/react";
import { useMemo, useRef } from "react";
import { audioPlayerMachine } from "../context/audio-player-machine";
import { TinpotsPianoInstrument } from "@/src/audio/instruments/tinpots-piano";
import { BreadBreadOverdrivenGuitarInstrument } from "@/src/audio/instruments/bread-bread-overdriven-guitar";

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
      new TinpotsPianoInstrument(),
    );
    (engineRef.current as MIDIPlaybackEngine).registerInstrument(
      "guitar__acoustic guitar (nylon)",
      new BreadBreadOverdrivenGuitarInstrument(),
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

import {
  InstrumentRegistries,
  instrumentRegistries,
} from "@/src/audio/instruments";
import { createMIDIPlaybackEngine } from "@/src/audio/playback";
import { AudioPlayerEngine } from "@/src/audio/playback/core";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine/midi-playback-engine";
import { SongData } from "@/src/shared/types";
import { Midi, Track } from "@tonejs/midi";
import { assign, fromPromise, setup } from "xstate";

/**
 * The events that can be sent to the audio player state machine.
 */
export type AudioPlayerMachineEvent =
  | {
      type: "LOAD";
      payload: {
        currentSong: SongData;
      };
    }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | {
      type: "UPDATE_CURRENT_TRACK";
      payload: {
        trackIndex: number;
      };
    };

export type AudioPlaybackMachineMetadata = {
  beatsPerMinute: number;
  timeSignature: [number, number];
  totalMeasures: number;
  totalLength: number;
  durationOfQuarter: number;
  durationOfMeasure: number;
};

export type AudioPlaybackMachineLoadResult = {
  metadata: AudioPlaybackMachineMetadata;
  playableTracks: PlayableTrack[];
  firstTrackIndex: number;
};

/**
 * The context of the audio player state machine.
 */
export type AudioPlayerMachineContext<TSource = unknown> = {
  playbackEngineRef: React.RefObject<AudioPlayerEngine<TSource> | null>;
  metadata: AudioPlaybackMachineMetadata | null;
  playableTracks: PlayableTrack[] | null;
  currentTrackIndex: number | null;
};

/**
 * The input type of the audio player state machine.
 */
export type AudioPlayerMachineInput<TSource = unknown> = {
  playbackEngineRef: React.RefObject<AudioPlayerEngine<TSource> | null>;
};

/**
 * The state machine for the audio player in order to manage the state of the audio player.
 */
export const audioPlaybackEngineMachine = setup({
  types: {
    context: {} as AudioPlayerMachineContext<Midi>,
    input: {} as AudioPlayerMachineInput<Midi>,
    events: {} as AudioPlayerMachineEvent,
  },
  actors: {
    load: fromPromise<
      AudioPlaybackMachineLoadResult,
      {
        playbackEngineRef: React.RefObject<AudioPlayerEngine<Midi> | null>;
        currentSong: SongData;
      }
    >(async ({ input }) => {
      if (input.playbackEngineRef.current) {
        input.playbackEngineRef.current.dispose();
      }
      input.playbackEngineRef.current = createMIDIPlaybackEngine();

      for (const [trackKey, trackValue] of Object.entries(
        input.currentSong.tracks ?? {},
      )) {
        const instrumentFactory =
          instrumentRegistries[
            trackValue.instrument.engine as InstrumentRegistries
          ];
        if (!instrumentFactory) {
          console.warn(
            `No instrument factory found for track | Key: ${trackKey} | Value: ${trackValue.instrument.engine}`,
          );
          continue;
        }
        (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).registerInstrument(trackKey, instrumentFactory());
      }

      const result = await input.playbackEngineRef.current.load(
        input.currentSong.sources?.midi ?? "",
      );
      if (!result?.success) {
        throw result?.error;
      }

      const metadata = {
        beatsPerMinute: (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).getBeatsPerMinute(),

        timeSignature: (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).getTimeSignature(),

        totalLength: (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).getTotalLength(),

        durationOfQuarter: (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).getTQuarter(),

        durationOfMeasure: (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).getTMeasure(),

        totalMeasures: (
          input.playbackEngineRef.current as MIDIPlaybackEngine
        ).getTotalMeasures(),
      };

      const playableTracks =
        (input.playbackEngineRef.current as MIDIPlaybackEngine)
          .getSource()
          ?.tracks.map((track: Track, index: number) => ({
            id: index,
            name: track.name,
            instrument: {
              family: track.instrument.family,
              name: track.instrument.name,
            },
            notesLength: track.notes.length,
          })) ?? [];

      const firstTrackIndex = playableTracks[0]?.id;

      return {
        metadata,
        playableTracks,
        firstTrackIndex,
      };
    }),
  },
  actions: {
    play: ({ context }) => {
      void context.playbackEngineRef.current?.play();
    },
    pause: ({ context }) => {
      void context.playbackEngineRef.current?.pause();
    },
    stop: ({ context }) => {
      void context.playbackEngineRef.current?.stop();
    },
  },
}).createMachine({
  id: "audio-playback-engine-machine",
  initial: "idle",
  context: ({ input }) => ({
    playbackEngineRef: input.playbackEngineRef,
    metadata: null,
    playableTracks: [],
    currentTrackIndex: null,
  }),

  on: {
    UPDATE_CURRENT_TRACK: {
      actions: assign({
        currentTrackIndex: ({ event }) => {
          if (event.type !== "UPDATE_CURRENT_TRACK") return null;
          return event.payload.trackIndex;
        },
      }),
    },
  },

  states: {
    idle: {
      on: {
        LOAD: "loading",
      },
    },

    loading: {
      invoke: {
        src: "load",
        input: ({ context, event }) => {
          if (event.type !== "LOAD")
            throw new Error("load actor invoked without LOAD event");
          return {
            playbackEngineRef: context.playbackEngineRef,
            currentSong: event.payload.currentSong,
          };
        },
        onDone: {
          target: "ready",
          actions: [
            assign({
              metadata: ({ event }) => event.output.metadata,
              playableTracks: ({ event }) => event.output.playableTracks,
              currentTrackIndex: ({ event }) => event.output.firstTrackIndex,
            }),
          ],
        },
        onError: {
          target: "error",
        },
      },
    },

    ready: {
      on: {
        PLAY: "playing",
      },
    },

    playing: {
      entry: "play",
      on: {
        PAUSE: "paused",
        STOP: {
          target: "ready",
          actions: "stop",
        },
      },
    },

    paused: {
      entry: "pause",
      on: {
        PLAY: "playing",
        STOP: {
          target: "ready",
          actions: "stop",
        },
      },
    },

    error: {},
  },
});

/**
 * @deprecated
 */
export type PlayableTrack = {
  id: number;
  name: string;
  instrument: {
    family: string;
    name: string;
  };
  notesLength: number;
};

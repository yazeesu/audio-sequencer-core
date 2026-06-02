import { PlaybackEngine } from "@/src/core/playback/interfaces";
import { SongData } from "@/src/shared/types";
import React from "react";
import { assign, fromPromise, setup } from "xstate";

export type PlaybackStateMachineLoadResult<
  TMetadata extends Record<string, unknown>,
  TState extends Record<string, unknown>,
> = {
  metadata: TMetadata;
  data: TState;
};

export type PlaybackStateMachineLoadSessionFn<
  TEngine extends PlaybackEngine,
  TMetadata extends Record<string, unknown>,
  TState extends Record<string, unknown>,
> = (
  engine: TEngine,
  song: SongData,
) => Promise<PlaybackStateMachineLoadResult<TMetadata, TState>>;

export type PlaybackStateMachineInput<
  TEngine extends PlaybackEngine,
  TMetadata extends Record<string, unknown>,
  TState extends Record<string, unknown>,
> = {
  playbackEngineRef: React.RefObject<TEngine | null>;
  createEngine: () => TEngine;
  loadSession: PlaybackStateMachineLoadSessionFn<TEngine, TMetadata, TState>;
};

export type PlaybackStateMachineContext<
  TEngine extends PlaybackEngine,
  TMetadata extends Record<string, unknown>,
  TState extends Record<string, unknown>,
> = {
  playbackEngineRef: React.RefObject<TEngine | null>;
  createEngine: () => TEngine;
  loadSession: PlaybackStateMachineLoadSessionFn<TEngine, TMetadata, TState>;
  metadata: TMetadata | null;
  data: TState | null;
};

export type PlaybackStateMachineLoadActorInput<
  TEngine extends PlaybackEngine,
  TMetadata extends Record<string, unknown>,
  TState extends Record<string, unknown>,
> = PlaybackStateMachineInput<TEngine, TMetadata, TState> & {
  song: SongData;
};

export type PlaybackStateMachineEvents =
  | { type: "LOAD"; payload: { song: SongData } }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STOP" };

export function createPlaybackStateMachine<
  TEngine extends PlaybackEngine,
  TMetadata extends Record<string, unknown>,
  TState extends Record<string, unknown>,
>() {
  return setup({
    types: {
      context: {} as PlaybackStateMachineContext<TEngine, TMetadata, TState>,
      input: {} as PlaybackStateMachineInput<TEngine, TMetadata, TState>,
      events: {} as PlaybackStateMachineEvents,
    },

    actors: {
      load: fromPromise<
        PlaybackStateMachineLoadResult<TMetadata, TState>,
        PlaybackStateMachineLoadActorInput<TEngine, TMetadata, TState>
      >(async ({ input }) => {
        if (input.playbackEngineRef.current) {
          input.playbackEngineRef.current.dispose();
        }
        const engine = input.createEngine();
        input.playbackEngineRef.current = engine;
        return input.loadSession(engine, input.song);
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
    id: "playback-state-machine",
    initial: "IDLE",

    context: ({ input }) => ({
      playbackEngineRef: input.playbackEngineRef,
      createEngine: input.createEngine,
      loadSession: input.loadSession,
      metadata: null,
      data: null,
    }),

    states: {
      IDLE: {
        on: {
          LOAD: "LOADING",
        },
      },

      LOADING: {
        invoke: {
          src: "load",
          input: ({ context, event }) => {
            if (event.type !== "LOAD")
              throw new Error("load actor invoked without LOAD event");

            return {
              playbackEngineRef: context.playbackEngineRef,
              createEngine: context.createEngine,
              loadSession: context.loadSession,
              song: event.payload.song,
            };
          },
          onDone: {
            target: "READY",
            actions: [
              assign({
                metadata: ({ event }) => event.output.metadata,
                data: ({ event }) => event.output.data,
              }),
            ],
          },
          onError: {
            target: "ERROR",
          },
        },
      },

      READY: {
        on: {
          PLAY: "PLAYING",
        },
      },

      PLAYING: {
        entry: "play",
        on: {
          PAUSE: "PAUSED",
          STOP: {
            target: "READY",
            actions: "stop",
          },
        },
      },

      PAUSED: {
        entry: "pause",
        on: {
          PLAY: "PLAYING",
          STOP: {
            target: "READY",
            actions: "stop",
          },
        },
      },

      ERROR: {},

      DISPOSED: {},
    },
  });
}

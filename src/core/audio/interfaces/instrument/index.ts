import { PitchName } from "@/src/core/music/types";

export type PlayableInstrumentAttackFnParams = {
  note: PitchName;
  velocity?: number;
  duration?: number;
  time?: number;
};

export type PlayableInstrumentReleaseFnParams = {
  note: PitchName;
  velocity?: number;
  duration?: number;
  time?: number;
};

/**
 * The instrument audio engine interface.
 * This interface is used to play and mute notes using a specific instrument.
 */
export interface PlayableInstrument {
  /**
   * Plays a note.
   */
  attack(params: PlayableInstrumentAttackFnParams): Promise<void>;

  /**
   * Mutes the target note.
   */
  release(params: PlayableInstrumentReleaseFnParams): Promise<void>;

  /**
   * Disposes the audio engine.
   * This function should be called when the audio engine is no longer needed.
   * It cleans up all the resources used by the audio engine in order to prevent memory leaks.
   */
  dispose(): void;
}

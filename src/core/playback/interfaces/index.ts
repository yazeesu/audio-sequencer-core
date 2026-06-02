import { PlayableInstrument } from "../../audio/interfaces";
import { PlaybackSourceLoadResult } from "../types";

/**
 * The audio playback engine interface.
 */
export interface PlaybackEngine {
  /**
   * Returns the current time of the audio source.
   */
  getCurrentTime(): number;

  /**
   * Plays the audio source.
   */
  play(): Promise<void>;

  /**
   * Restarts the audio source from the beginning of the source.
   */
  restart(): Promise<void>;

  /**
   * Pauses the audio source.
   * However, the audio source will be paused at the current position.
   */
  pause(): Promise<void>;

  /**
   * Stops the audio source completely.
   */
  stop(): Promise<void>;

  /**
   * Disposes the audio player engine.
   * This function should be called when the audio player engine is no longer needed.
   * It cleans up all the resources used by the audio player engine in order to prevent memory leaks.
   */
  dispose(): void;
}

export interface LoadablePlaybackEngine<TSource = unknown, TError = Error> {
  /**
   * Returns the audio source.
   */
  getSource(): TSource | null;

  /**
   * Loads the audio source into the audio player engine.
   * First of all, the audio source MUST be loaded before playing it.
   * @param path - The path of the source to load.
   */
  load(path: string): Promise<PlaybackSourceLoadResult<TSource, TError>>;
}

/**
 * The measurable audio player engine interface.
 * This interface is used to get the time signature, beats per minute, current time, and total length of the audio source.
 * @see {@link AudioPlayerEngine} for the interface implementation.
 */
export interface TempoAwarePlaybackEngine {
  /**
   * Returns the time signature of the audio source.
   */
  getTimeSignature(): [number, number];

  /**
   * Returns the beats per minute of the audio source.
   */
  getBeatsPerMinute(): number;

  /**
   * Returns the duration of the audio source.
   */
  getTotalLength(): number;

  /**
   * Returns the duration of a quarter note.
   */
  getDurationOfQuarter(): number;

  /**
   * Returns the duration of a measure.
   */
  getDurationOfMeasure(): number;

  /**
   * Returns the total number of measures in the audio source.
   */
  getTotalMeasures(): number;
}

/**
 * The instrumental audio player engine interface.
 * This interface is used to register and unregister instruments into the audio player engine.
 * @see {@link InstrumentAudioEngine} for the interface implementation.
 */
export interface PlaybackEngineWithInstruments {
  /**
   * Registers an instrument into the audio player engine.
   * @param key - The key of the instrument.
   * @param instrument - The instrument to register.
   */
  registerInstrument(key: string, instrument: PlayableInstrument): void;

  /**
   * Removes an instrument from the audio player engine.
   * @param key - The key of the instrument to remove.
   */
  unregisterInstrument(key: string): void;

  clearInstruments(): void;
}

export interface ObservablePlaybackEngine<TEventMap = Record<string, unknown>> {
  /**
   * Subscribes to an event.
   * @param event - The event to subscribe to.
   * @param callback - The callback to call when the event is triggered.
   */
  subscribe<K extends keyof TEventMap>(
    event: K,
    callback: (data: TEventMap[K]) => void,
  ): void;

  /**
   * Unsubscribes from an event.
   * @param event - The event to unsubscribe from.
   * @param callback - The callback to unsubscribe from.
   */
  unsubscribe<K extends keyof TEventMap>(
    event: K,
    callback: (data: TEventMap[K]) => void,
  ): void;
}

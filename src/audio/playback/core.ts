import { Track } from "@tonejs/midi";
import { InstrumentAudioEngine } from "../core";

export type Measure = {
  index: number;
  notes: {
    note: string;
    pitch: number;
    startTime: number;
    duration: number;
  }[];
};

/**
 * The result of loading a audio source into an audio player engine.
 */
export type AudioPlayerSourceLoadResult<TData = unknown> =
  /**
   * The loading was successful.
   * @param source - The path of the source that was loaded.
   * @param data - The data of the source that was loaded.
   */
  | { success: true; source: string; data: TData }

  /**
   * The loading failed.
   * @param error - The error that occurred during the loading.
   * @param reason - The reason why the loading failed.
   */
  | { success: false; error: Error; reason: string };

/**
 * The audio playback engine interface.
 */
export interface AudioPlayerEngine<TSource = unknown> {
  /**
   * Returns the audio source.
   */
  getSource(): TSource | null;

  /**
   * Loads the audio source into the audio player engine.
   * First of all, the audio source MUST be loaded before playing it.
   * @param source - The path of the source to load.
   */
  load(source: string): Promise<AudioPlayerSourceLoadResult<TSource>>;

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

/**
 * The measurable audio player engine interface.
 * This interface is used to get the time signature, beats per minute, current time, and total length of the audio source.
 * @see {@link AudioPlayerEngine} for the interface implementation.
 */
export interface MeasurableAudioPlayerEngine {
  /**
   * Returns the time signature of the audio source.
   */
  getTimeSignature(): [number, number];

  /**
   * Returns the beats per minute of the audio source.
   */
  getBeatsPerMinute(): number;

  /**
   * Returns the current time of the audio source.
   */
  getCurrentTime(): number;

  /**
   * Returns the duration of the audio source.
   */
  getTotalLength(): number;

  getTQuarter(): number;

  getTMeasure(): number;

  getTotalMeasures(): number;

  getMeasuresForTrack(track: Track): Measure[];
}

/**
 * The instrumental audio player engine interface.
 * This interface is used to register and unregister instruments into the audio player engine.
 * @see {@link InstrumentAudioEngine} for the interface implementation.
 */
export interface InstrumentalAudioPlayerEngine {
  /**
   * Registers an instrument into the audio player engine.
   * @param key - The key of the instrument.
   * @param instrument - The instrument to register.
   */
  registerInstrument(key: string, instrument: InstrumentAudioEngine): void;

  /**
   * Removes an instrument from the audio player engine.
   * @param key - The key of the instrument to remove.
   */
  unregisterInstrument(key: string): void;

  clearInstruments(): void;
}

/**
 * The observable audio player engine interface.
 * This interface is used to subscribe to and unsubscribe from events emitted by the audio player engine.
 * @template TEventMap - The map of events and their data.
 */
export interface ObservableAudioPlayerEngine<
  TEventMap = Record<string, unknown>,
> {
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

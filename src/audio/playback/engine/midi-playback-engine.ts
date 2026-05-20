import { Midi, Track } from "@tonejs/midi";
import * as Tone from "tone";
import { InstrumentAudioEngine } from "../../core";
import { MIDIPlaybackError } from "../errors";
import {
  AudioPlayerEngine,
  AudioPlayerSourceLoadResult,
  InstrumentalAudioPlayerEngine,
  MeasurableAudioPlayerEngine,
  Measure,
  ObservableAudioPlayerEngine,
} from "../core";
import { MIDIPlaybackEventBus } from "../utilities/midi-playback-event-bus";
import { injectable } from "tsyringe";
import { MIDIPlaybackInstrumentScheduler } from "../utilities/midi-playback-instrument-scheduler";
import { MIDIPlaybackMeter } from "../utilities/midi-playback-meter";
import { MIDIPlaybackSourceLoader } from "../utilities/midi-playback-source-loader";
import { tryCatch } from "@/src/shared/utils";

export enum MIDIPlaybackEngineEvents {
  TIME_SIGNATURE_CHANGED = "time-signature-changed",
  BEATS_PER_MINUTE_CHANGED = "beats-per-minute-changed",
  TOTAL_LENGTH_CHANGED = "total-length-changed",
  CURRENT_TIME_CHANGED = "current-time-changed",
}

export type MIDIPlaybackEngineEventMap = {
  [MIDIPlaybackEngineEvents.TIME_SIGNATURE_CHANGED]: [number, number];
  [MIDIPlaybackEngineEvents.BEATS_PER_MINUTE_CHANGED]: number;
  [MIDIPlaybackEngineEvents.TOTAL_LENGTH_CHANGED]: number;
  [MIDIPlaybackEngineEvents.CURRENT_TIME_CHANGED]: number;
};

/**
 * Imports `.mid` files and plays them using the ToneJS library.
 * @implements {AudioPlayerEngine<Midi>}
 * @see {@link AudioPlayerEngine} for the interface implementation.
 */
@injectable()
export class MIDIPlaybackEngine
  implements
    AudioPlayerEngine<Midi>,
    ObservableAudioPlayerEngine<MIDIPlaybackEngineEventMap>,
    InstrumentalAudioPlayerEngine,
    MeasurableAudioPlayerEngine
{
  private source: Midi | null = null;
  private readonly transport = Tone.getTransport();

  constructor(
    private readonly loader: MIDIPlaybackSourceLoader,
    private readonly eventBus: MIDIPlaybackEventBus<MIDIPlaybackEngineEventMap>,
    private readonly instrumentScheduler: MIDIPlaybackInstrumentScheduler,
    private readonly meter: MIDIPlaybackMeter,
  ) {}

  subscribe<K extends keyof MIDIPlaybackEngineEventMap>(
    event: K,
    callback: (data: MIDIPlaybackEngineEventMap[K]) => void,
  ): void {
    this.eventBus.subscribe(event, callback);
  }

  unsubscribe<K extends keyof MIDIPlaybackEngineEventMap>(
    event: K,
    callback: (data: MIDIPlaybackEngineEventMap[K]) => void,
  ): void {
    this.eventBus.unsubscribe(event, callback);
  }

  clearInstruments(): void {
    this.instrumentScheduler.clearInstruments();
  }

  registerInstrument(key: string, instrument: InstrumentAudioEngine): void {
    this.instrumentScheduler.registerInstrument(key, instrument);
  }

  unregisterInstrument(key: string): void {
    this.instrumentScheduler.unregisterInstrument(key);
  }

  getTimeSignature(): [number, number] {
    return this.meter.getTimeSignature();
  }

  getBeatsPerMinute(): number {
    return this.meter.getBeatsPerMinute();
  }

  getCurrentTime(): number {
    return this.transport.seconds;
  }

  getTotalLength(): number {
    return this.meter.getTotalLength();
  }

  getTQuarter(): number {
    return this.meter.getTQuarter();
  }

  getTMeasure(): number {
    return this.meter.getTMeasure();
  }

  getTotalMeasures(): number {
    return this.meter.getTotalMeasures();
  }

  getMeasuresForTrack(track: Track): Measure[] {
    return this.meter.getMeasuresForTrack(track);
  }

  getCurrentMeasure(): number {
    return this.meter.getCurrentMeasure();
  }

  getSource(): Midi | null {
    return this.source;
  }

  async load(source: string): Promise<AudioPlayerSourceLoadResult<Midi>> {
    const [result, error] = await tryCatch<
      AudioPlayerSourceLoadResult<Midi>,
      Error
    >(this.loader.load(source));
    if (error) throw error;

    if (!result?.success) {
      throw result?.error;
    }

    this.source = result.data;
    this.meter.initialize(this.source, this.transport);

    return result;
  }

  async play(): Promise<void> {
    if (this.source === null) {
      throw new MIDIPlaybackError(
        "MIDI file is not loaded",
        "No MIDI file loaded",
      );
    }
    await Tone.start();

    this.transport.stop();
    this.transport.cancel();

    this.transport.position = 0;
    this.transport.bpm.value = this.getBeatsPerMinute();

    this.instrumentScheduler.scheduleNotes(this.source, this.transport);

    this.transport.start();
  }

  async restart(): Promise<void> {
    return Promise.resolve();
  }

  async pause(): Promise<void> {
    return Promise.resolve();
  }

  async stop(): Promise<void> {
    return Promise.resolve();
  }

  dispose(): void {
    this.transport.stop();
    this.transport.cancel();

    this.instrumentScheduler.clearInstruments();

    this.source = null;
  }
}

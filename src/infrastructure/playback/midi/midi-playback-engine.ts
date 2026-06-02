import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { injectable } from "tsyringe";
import {
  MIDIPlaybackEngineEventMap,
  MIDIPlaybackEngineInterface,
} from "./types";
import { MIDIPlaybackSourceLoader } from "./utilities/midi-playback-source-loader";
import { MIDIPlaybackEventBus } from "./utilities/midi-playback-event-bus";
import { MIDIPlaybackInstrumentScheduler } from "./utilities/midi-playback-instrument-scheduler";
import { MIDIPlaybackMeter } from "./utilities/midi-playback-meter";
import { PlayableInstrument } from "@/src/core/audio/interfaces";
import { PlaybackSourceLoadError } from "@/src/core/playback/errors";
import { PlaybackSourceLoadResult } from "@/src/core/playback/types";
import { tryCatch } from "@/src/shared/utils";

@injectable()
export class MIDIPlaybackEngine implements MIDIPlaybackEngineInterface {
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

  registerInstrument(key: string, instrument: PlayableInstrument): void {
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

  getDurationOfQuarter(): number {
    return this.meter.getTQuarter();
  }

  getDurationOfMeasure(): number {
    return this.meter.getTMeasure();
  }

  getTotalMeasures(): number {
    return this.meter.getTotalMeasures();
  }

  getCurrentMeasure(): number {
    return this.meter.getCurrentMeasure();
  }

  getSource(): Midi | null {
    return this.source;
  }

  async load(path: string): Promise<PlaybackSourceLoadResult<Midi>> {
    const [source, error] = await tryCatch<Midi, Error>(this.loader.load(path));
    if (error) {
      console.error("Failed to load MIDI file", error.message);
      return {
        success: false,
        error,
      };
    }

    this.source = source;
    this.meter.initialize(this.source, this.transport);

    return {
      success: true,
      source,
      path,
    };
  }

  async play(): Promise<void> {
    if (this.source === null) {
      throw new PlaybackSourceLoadError(
        "MIDI file is not loaded.",
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

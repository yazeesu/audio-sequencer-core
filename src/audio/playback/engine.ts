import { Midi, Track } from "@tonejs/midi";
import * as Tone from "tone";
import { InstrumentAudioEngine } from "../core";
import { MIDIPlaybackError, MIDISourceError } from "./errors";
import {
  AudioPlayerEngine,
  AudioPlayerSourceLoadResult,
  InstrumentalAudioPlayerEngine,
  MeasurableAudioPlayerEngine,
  Measure,
  ObservableAudioPlayerEngine,
} from "./core";

export type MIDIPlaybackEngineEventMap = {
  "time-signature-changed": [number, number];
  "beats-per-minute-changed": number;
  "total-length-changed": number;
  "current-time-changed": number;
};

/**
 * Imports `.mid` files and plays them using the ToneJS library.
 * @implements {AudioPlayerEngine<Midi>}
 * @see {@link AudioPlayerEngine} for the interface implementation.
 */
export class MIDIPlaybackEngine
  implements
    AudioPlayerEngine<Midi>,
    ObservableAudioPlayerEngine<any>,
    InstrumentalAudioPlayerEngine,
    MeasurableAudioPlayerEngine
{
  private source: Midi | null = null;

  private readonly observers: Map<string, Set<(data: any) => void>> = new Map();
  private readonly orchestrator: Map<string, InstrumentAudioEngine> = new Map();
  private readonly transport = Tone.getTransport();

  subscribe<K extends string | number | symbol>(
    event: K,
    callback: (data: any) => void,
  ): void {
    const eventKey = String(event);
    if (!this.observers.has(eventKey)) {
      this.observers.set(eventKey, new Set());
    }
    this.observers.get(eventKey)!.add(callback);
  }

  unsubscribe<K extends string | number | symbol>(
    event: K,
    callback: (data: any) => void,
  ): void {
    const eventKey = String(event);
    this.observers.get(eventKey)?.delete(callback);
  }

  /**
   * Helper to emit events to all registered observers.
   * @param event The event name
   * @param data The data to send to observers
   */
  private emit<K extends keyof MIDIPlaybackEngineEventMap>(
    event: K,
    data: MIDIPlaybackEngineEventMap[K],
  ): void {
    const observers = this.observers.get(String(event));
    if (observers) {
      for (const cb of observers) {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in observer for ${String(event)}`, error);
        }
      }
    }
  }

  registerInstrument(key: string, instrument: InstrumentAudioEngine): void {
    this.orchestrator.set(key, instrument);
  }

  unregisterInstrument(key: string): void {
    this.orchestrator.delete(key);
  }

  getTimeSignature(): [number, number] {
    const timeSignature = this.source?.header.timeSignatures[0]?.timeSignature;
    return timeSignature ? [timeSignature[0], timeSignature[1]] : [4, 4];
  }

  getBeatsPerMinute(): number {
    return this.source?.header.tempos[0]?.bpm ?? 120;
  }

  getCurrentTime(): number {
    return this.transport.seconds;
  }

  getTotalLength(): number {
    return this.source?.duration ?? 0;
  }

  getTQuarter(): number {
    return 60 / this.getBeatsPerMinute();
  }

  getTMeasure(): number {
    const tQuarter = this.getTQuarter();
    const timeSignature = this.getTimeSignature();
    return tQuarter * (timeSignature[0] / (4 / timeSignature[1]));
  }

  getTotalMeasures(): number {
    return Math.ceil(this.getTotalLength() / this.getTMeasure());
  }

  getMeasuresForTrack(track: Track): Measure[] {
    const measures = Array.from(
      { length: this.getTotalMeasures() },
      () => [] as any,
    );

    const tMeasure = this.getTMeasure();

    for (const note of track.notes) {
      const measureIndex = Math.floor(note.time / tMeasure);
      const relativeStart = note.time % tMeasure;

      const calculatedDuration =
        note.duration > tMeasure ? tMeasure - relativeStart : note.duration;

      measures[measureIndex].push({
        note: note.name,
        pitch: note.midi,
        startTime: relativeStart,
        duration: calculatedDuration,
      });
    }

    return measures.map((measure, index) => ({
      index,
      notes: measure,
    }));
  }

  getCurrentMeasure(): number {
    return Math.floor(this.getCurrentTime() / this.getTMeasure());
  }

  getSource(): Midi | null {
    return this.source;
  }

  async load(source: string): Promise<AudioPlayerSourceLoadResult<Midi>> {
    try {
      const response = await fetch(source);

      if (!response.ok) {
        throw new MIDISourceError("Failed to fetch MIDI file", "HTTP error");
      }

      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      this.source = midi;

      this.emit("time-signature-changed", this.getTimeSignature());
      this.emit("beats-per-minute-changed", this.getBeatsPerMinute());
      this.emit("total-length-changed", this.getTotalLength());
      this.emit("current-time-changed", this.getCurrentTime());

      return {
        success: true,
        data: midi,
        source,
      };
    } catch (error) {
      const e =
        error instanceof Error
          ? error
          : new MIDISourceError("Failed to fetch MIDI file", "Unknown error");
      return {
        success: false,
        error: e,
        reason: e.message,
      };
    }
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

    this.source.tracks.forEach((track) => {
      const instrument = this.orchestrator.get(
        track.instrument.family + "__" + track.instrument.name,
      );

      if (!instrument) {
        console.warn(
          `No instrument found for track | Name : ${track.instrument.name} | Family: ${track.instrument.family}`,
        );
        return;
      }

      track.notes.forEach((note) => {
        const n = Tone.Frequency(note.midi, "midi").toNote();
        const vel = Math.max(0.05, Math.min(1, note.velocity));
        const start = note.time;
        const end = start + note.duration;

        this.transport.schedule(() => {
          void instrument.playNote({ note: n, velocity: vel });
        }, start);

        this.transport.schedule(() => {
          void instrument.muteNote({ note: n });
        }, end);
      });
    });

    this.transport.scheduleRepeat((time) => {
      Tone.getDraw().schedule(() => {
        this.emit("current-time-changed", this.getCurrentTime());
      }, time);
    }, "0.1");

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

    this.orchestrator.forEach((instrument) => instrument.dispose());
    this.orchestrator.clear();

    this.source = null;
  }
}

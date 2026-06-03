import * as Tone from "tone";
import { InstrumentAudioEngine } from "../core";

export class BreadBreadOverdrivenGuitarInstrument implements InstrumentAudioEngine {
  private sampler: Tone.Sampler | null = null;
  private loadedSample: Promise<void>;

  constructor() {
    const baseUrl = "/samples/overdriven_guitar/";

    this.loadedSample = new Promise((resolve, reject) => {
      this.sampler = new Tone.Sampler({
        urls: {
          C1: "24_C1.wav",
          "F#1": "30_FSharp1.wav",
          C2: "36_C2.wav",
          "F#2": "42_FSharp2.wav",
          C3: "48_C3.wav",
          "F#3": "54_FSharp3.wav",
          C4: "60_C4.wav",
          "F#4": "66_FSharp4.wav",
        },
        baseUrl,
        release: 1,
        onload: () => resolve(),
        onerror: () => reject(new Error("Failed to load piano samples")),
      }).toDestination();
    });
  }

  async playNote(options: {
    note: string;
    velocity?: number;
    duration?: number;
    time?: number;
  }): Promise<void> {
    await this.loadedSample;
    const { note, velocity = 0.85, time = Tone.now() } = options;
    this.sampler?.triggerAttack(note, time, velocity);
  }

  async muteNote(options: { note: string }): Promise<void> {
    await this.loadedSample;
    const { note } = options;
    this.sampler?.triggerRelease(note);
  }

  async muteAllNotes(): Promise<void> {
    await this.loadedSample;
    this.sampler?.releaseAll();
  }

  dispose(): void {
    this.sampler?.dispose();
  }
}

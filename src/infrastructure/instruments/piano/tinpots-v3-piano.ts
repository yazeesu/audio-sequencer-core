import * as Tone from "tone";
import {
  PlayableInstrument,
  PlayableInstrumentAttackFnParams,
  PlayableInstrumentReleaseFnParams,
} from "@/src/core/audio/interfaces";

export class TinpotsV3PianoInstrument implements PlayableInstrument {
  private sampler: Tone.Sampler | null = null;
  private loadedSample: Promise<void>;

  constructor() {
    const baseUrl = "/samples/piano/";

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
          C5: "72_C5.wav",
          "F#5": "78_FSharp5.wav",
        },
        baseUrl,
        release: 1,
        onload: () => resolve(),
        onerror: () => reject(new Error("Failed to load piano samples")),
      }).toDestination();
    });
  }

  async attack(params: PlayableInstrumentAttackFnParams): Promise<void> {
    await this.loadedSample;
    const { note, velocity = 0.85, time = Tone.now() } = params;
    this.sampler?.triggerAttack(note, time, velocity);
  }

  async release(params: PlayableInstrumentReleaseFnParams): Promise<void> {
    await this.loadedSample;
    const { note } = params;
    this.sampler?.triggerRelease(note);
  }

  dispose(): void {
    this.sampler?.dispose();
  }
}

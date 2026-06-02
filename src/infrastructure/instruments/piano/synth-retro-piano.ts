import * as Tone from "tone";
import {
  PlayableInstrument,
  PlayableInstrumentAttackFnParams,
  PlayableInstrumentReleaseFnParams,
} from "@/src/core/audio/interfaces";
import { ToneEffectController } from "../../audio/tonejs/tone-effect-controller";
import { ToneReverbNode } from "../../audio/tonejs/effects/tone-reverb-node";
import { ToneHighpassNode } from "../../audio/tonejs/effects/tone-highpass-node";
import { ToneLowpassNode } from "../../audio/tonejs/effects/tone-lowpass-node";

interface SynthRetroPianoInstrumentInterface extends PlayableInstrument {}

export class SynthRetroPianoInstrument implements SynthRetroPianoInstrumentInterface {
  private synth: Tone.PolySynth;
  private effectController: ToneEffectController;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "triangle32",
      },

      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 1.2,
      },
    });

    this.effectController = new ToneEffectController(this.synth);
    this.effectController.addEffect(
      new ToneHighpassNode({
        frequency: 120,
        rolloff: -24,
        Q: 0.5,
      }),
    );
    this.effectController.addEffect(
      new ToneLowpassNode({
        frequency: 6000,
        rolloff: -24,
        Q: 0.5,
      }),
    );
    this.effectController.addEffect(
      new ToneReverbNode({
        decay: 3,
        wet: 0.25,
      }),
    );
  }

  async attack(params: PlayableInstrumentAttackFnParams): Promise<void> {
    const { note, velocity = 0.8, duration = 0.1 } = params;
    this.synth.triggerAttack(note, duration, velocity);
  }

  async release(params: PlayableInstrumentReleaseFnParams): Promise<void> {
    const { note } = params;
    this.synth.triggerRelease(note);
  }

  dispose(): void {
    this.synth.dispose();
    this.effectController.dispose();
  }
}

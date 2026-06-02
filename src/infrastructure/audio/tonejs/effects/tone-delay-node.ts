import * as Tone from "tone";
import { BaseAudioEffectNode } from "@/src/core/audio/interfaces/effect";
import { EffectType } from "@/src/core/audio/types";

export class ToneDelayNode extends BaseAudioEffectNode<EffectType, Tone.Delay> {
  protected readonly type: EffectType = "delay";
  protected readonly node: Tone.Delay;

  constructor() {
    super();
    this.node = new Tone.Delay(0.5, 0.5);
  }

  updateAttributes(attributes: Record<string, any>): void {
    Object.assign(this.node, attributes);
  }

  dispose(): void {
    this.node.dispose();
  }
}

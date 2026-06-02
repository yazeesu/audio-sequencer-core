import * as Tone from "tone";
import { BaseAudioEffectNode } from "@/src/core/audio/interfaces/effect";
import { EffectType } from "@/src/core/audio/types";

export class ToneReverbNode extends BaseAudioEffectNode<
  EffectType,
  Tone.Reverb
> {
  protected readonly type: EffectType = "reverb";
  protected readonly node: Tone.Reverb;

  constructor(params: Partial<Tone.ReverbOptions> = {}) {
    super();

    const defaultParams: Partial<Tone.ReverbOptions> = {
      decay: 3,
      wet: 0.25,
    };

    this.node = new Tone.Reverb({
      ...defaultParams,
      ...params,
    });
  }

  updateAttributes(attributes: Record<string, any>): void {
    Object.assign(this.node, attributes);
  }

  dispose(): void {
    this.node.dispose();
  }
}

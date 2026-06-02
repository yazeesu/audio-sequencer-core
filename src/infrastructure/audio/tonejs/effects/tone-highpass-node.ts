import * as Tone from "tone";
import { BaseAudioEffectNode } from "@/src/core/audio/interfaces/effect";
import { EffectType } from "@/src/core/audio/types";

export class ToneHighpassNode extends BaseAudioEffectNode<
  EffectType,
  Tone.Filter
> {
  protected readonly type: EffectType = "highpass";
  protected readonly node: Tone.Filter;

  constructor(params: Partial<Tone.FilterOptions> = {}) {
    super();

    const defaultParams: Partial<Tone.FilterOptions> = {
      type: "highpass",
      frequency: 120,
      rolloff: -24,
      Q: 0.5,
    };

    this.node = new Tone.Filter({ ...defaultParams, ...params });
  }

  updateAttributes(attributes: Record<string, any>): void {
    Object.assign(this.node, attributes);
  }

  dispose(): void {
    this.node.dispose();
  }
}

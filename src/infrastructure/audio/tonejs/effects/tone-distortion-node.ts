import * as Tone from "tone";
import { BaseAudioEffectNode } from "@/src/core/audio/interfaces/effect";
import { EffectType } from "@/src/core/audio/types";

export class ToneDistortionNode extends BaseAudioEffectNode<
  EffectType,
  Tone.Distortion
> {
  protected readonly type: EffectType = "distortion";
  protected readonly node: Tone.Distortion;

  constructor() {
    super();
    this.node = new Tone.Distortion({
      distortion: 0,
      oversample: "4x",
    });
  }

  updateAttributes(attributes: Record<string, any>): void {
    Object.assign(this.node, attributes);
  }

  dispose(): void {
    this.node.dispose();
  }
}

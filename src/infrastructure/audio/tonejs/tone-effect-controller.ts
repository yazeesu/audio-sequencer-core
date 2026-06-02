import * as Tone from "tone";
import {
  AudioEffectController,
  BaseAudioEffectNode,
} from "@/src/core/audio/interfaces/effect";
import { EffectType } from "@/src/core/audio/types";

export class ToneEffectController implements AudioEffectController<
  EffectType,
  Tone.ToneAudioNode
> {
  private readonly effects: Map<
    string,
    BaseAudioEffectNode<EffectType, Tone.ToneAudioNode>
  > = new Map();
  private readonly sourceNode: Tone.ToneAudioNode;

  constructor(sourceNode: Tone.ToneAudioNode) {
    this.sourceNode = sourceNode;
  }

  public addEffect(
    effect: BaseAudioEffectNode<EffectType, Tone.ToneAudioNode>,
  ): void {
    this.effects.set(effect.getId(), effect);
    this.rebuildChain();
  }

  public removeEffect(
    effect: BaseAudioEffectNode<EffectType, Tone.ToneAudioNode>,
  ): void {
    const targetEffect = this.effects.get(effect.getId());
    if (targetEffect) {
      targetEffect.dispose();
    }
    this.effects.delete(effect.getId());
    this.rebuildChain();
  }

  public clearEffects(): void {
    this.effects.forEach((effect) =>
      this.sourceNode.disconnect(effect.getNode()),
    );
    this.effects.forEach((effect) => effect.dispose());
    this.effects.clear();
    this.rebuildChain();
  }

  public updateEffect(effectId: string, attributes: Record<string, any>): void {
    const effect = this.effects.get(effectId);
    if (effect) {
      effect.updateAttributes(attributes);
    }
  }

  public rebuildChain(): void {
    this.sourceNode.disconnect();
    this.effects.forEach((fx) => fx.getNode().disconnect());

    if (this.effects.size === 0) {
      this.sourceNode.toDestination();
      return;
    }

    let current: Tone.ToneAudioNode = this.sourceNode;
    for (const fx of this.effects.values()) {
      current.connect(fx.getNode());
      current = fx.getNode();
    }
    current.toDestination();
  }

  public getEffect(
    effectId: string,
  ): BaseAudioEffectNode<EffectType, Tone.ToneAudioNode> | null {
    return this.effects.get(effectId) as BaseAudioEffectNode<
      EffectType,
      Tone.ToneAudioNode
    > | null;
  }

  public getEffects(): BaseAudioEffectNode<EffectType, Tone.ToneAudioNode>[] {
    return Array.from(this.effects.values()) as BaseAudioEffectNode<
      EffectType,
      Tone.ToneAudioNode
    >[];
  }

  public dispose(): void {
    this.sourceNode.disconnect();
    this.clearEffects();
  }
}

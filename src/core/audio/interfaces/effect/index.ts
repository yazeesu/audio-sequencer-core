import { EffectType } from "../../types";
import { v4 as uuidv4 } from "uuid";

export abstract class BaseAudioEffectNode<
  TEffect = EffectType,
  TNode = unknown,
> {
  protected readonly id: string;
  protected abstract readonly type: TEffect;
  protected abstract readonly node: TNode;

  constructor() {
    this.id = uuidv4();
  }

  getId(): string {
    return this.id;
  }

  getType(): TEffect {
    return this.type;
  }

  getNode(): TNode {
    return this.node;
  }

  abstract updateAttributes(attributes: Record<string, any>): void;
  abstract dispose(): void;
}

export interface AudioEffectController<TEffect = EffectType, TNode = unknown> {
  addEffect(effect: BaseAudioEffectNode<TEffect, TNode>): void;
  removeEffect(effect: BaseAudioEffectNode<TEffect, TNode>): void;

  clearEffects(): void;

  updateEffect(effectId: string, attributes: Record<string, any>): void;

  rebuildChain(): void;

  dispose(): void;

  getEffect(effectId: string): BaseAudioEffectNode<TEffect, TNode> | null;
  getEffects(): BaseAudioEffectNode<TEffect, TNode>[];
}

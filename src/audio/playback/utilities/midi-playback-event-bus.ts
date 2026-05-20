import { injectable } from "tsyringe";

@injectable()
export class MIDIPlaybackEventBus<TEventMap = Record<string, unknown>> {
  private readonly observers: Map<
    string,
    Set<(data: TEventMap[keyof TEventMap]) => void>
  > = new Map();

  subscribe<K extends keyof TEventMap>(
    event: K,
    callback: (data: TEventMap[K]) => void,
  ): void {
    const eventKey = String(event);
    if (!this.observers.has(eventKey)) {
      this.observers.set(eventKey, new Set());
    }
    this.observers
      .get(eventKey)!
      .add(callback as (data: TEventMap[keyof TEventMap]) => void);
  }

  unsubscribe<K extends keyof TEventMap>(
    event: K,
    callback: (data: TEventMap[K]) => void,
  ): void {
    const eventKey = String(event);
    this.observers
      .get(eventKey)
      ?.delete(callback as (data: TEventMap[keyof TEventMap]) => void);
  }

  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    const observers = this.observers.get(String(event));
    if (observers) {
      for (const cb of observers) {
        cb(data);
      }
    }
  }
}

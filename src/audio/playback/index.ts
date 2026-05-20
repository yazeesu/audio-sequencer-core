import "reflect-metadata";
import { container } from "tsyringe";
import { MIDIPlaybackEngine } from "./engine/midi-playback-engine";
import { MIDIPlaybackSourceLoader } from "./utilities/midi-playback-source-loader";
import { MIDIPlaybackEventBus } from "./utilities/midi-playback-event-bus";
import { MIDIPlaybackInstrumentScheduler } from "./utilities/midi-playback-instrument-scheduler";
import { MIDIPlaybackMeter } from "./utilities/midi-playback-meter";
import { MIDIPlaybackEngineEventMap } from "./engine/midi-playback-engine";

export function createMIDIPlaybackEngine(): MIDIPlaybackEngine {
  const child = container.createChildContainer();

  child.register(MIDIPlaybackEngine, {
    useFactory: () => {
      return new MIDIPlaybackEngine(
        child.resolve(MIDIPlaybackSourceLoader),
        child.resolve(MIDIPlaybackEventBus<MIDIPlaybackEngineEventMap>),
        child.resolve(MIDIPlaybackInstrumentScheduler),
        child.resolve(MIDIPlaybackMeter),
      );
    },
  });

  return child.resolve(MIDIPlaybackEngine);
}

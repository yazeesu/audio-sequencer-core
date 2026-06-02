import { MIDIPlaybackEngine } from "@/src/infrastructure/playback/midi/midi-playback-engine";
import { MIDIPlaybackEngineEventMap } from "@/src/infrastructure/playback/midi/types";
import { MIDIPlaybackEventBus } from "@/src/infrastructure/playback/midi/utilities/midi-playback-event-bus";
import { MIDIPlaybackInstrumentScheduler } from "@/src/infrastructure/playback/midi/utilities/midi-playback-instrument-scheduler";
import { MIDIPlaybackMeter } from "@/src/infrastructure/playback/midi/utilities/midi-playback-meter";
import { MIDIPlaybackSourceLoader } from "@/src/infrastructure/playback/midi/utilities/midi-playback-source-loader";
import "reflect-metadata";
import { container } from "tsyringe";

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

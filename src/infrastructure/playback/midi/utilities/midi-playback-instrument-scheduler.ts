import * as Tone from "tone";
import { injectable } from "tsyringe";
import { PlayableInstrument } from "@/src/core/audio/interfaces";
import { Midi } from "@tonejs/midi";
import { PitchName } from "@/src/core/music/types";

@injectable()
export class MIDIPlaybackInstrumentScheduler {
  constructor(
    private readonly orchestrator: Map<string, PlayableInstrument> = new Map(),
  ) {}

  registerInstrument(key: string, instrument: PlayableInstrument): void {
    this.orchestrator.set(key, instrument);
  }

  unregisterInstrument(key: string): void {
    this.orchestrator.get(key)?.dispose();
    this.orchestrator.delete(key);
  }

  getInstrument(key: string): PlayableInstrument | null {
    return this.orchestrator.get(key) ?? null;
  }

  clearInstruments(): void {
    this.orchestrator.forEach((instrument) => instrument.dispose());
    this.orchestrator.clear();
  }

  scheduleNotes(source: Midi | null, transport: typeof Tone.Transport): void {
    if (source === null) return;
    source.tracks.forEach((track, index) => {
      const trackIndex = index.toString();
      const instrument = this.orchestrator.get(trackIndex);

      if (!instrument) {
        console.warn(
          `No instrument found for track | Name : ${track.instrument.name} | Family: ${track.instrument.family}`,
        );
        return;
      }

      track.notes.forEach((note) => {
        const n = Tone.Frequency(note.midi, "midi").toNote() as PitchName;
        const vel = Math.max(0.05, Math.min(1, note.velocity));
        const start = note.time;
        const end = start + note.duration;

        transport.schedule((time) => {
          void instrument.attack({ note: n, velocity: vel, time });
        }, start);

        transport.schedule(() => {
          void instrument.release({ note: n });
        }, end);
      });
    });
  }
}

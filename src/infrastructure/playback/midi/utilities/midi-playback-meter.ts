import * as Tone from "tone";
import { Midi, Track } from "@tonejs/midi";
import { injectable } from "tsyringe";
import { Measure } from "../core";

@injectable()
export class MIDIPlaybackMeter {
  private source: Midi | null = null;
  private transport!: typeof Tone.Transport;

  constructor() {}

  initialize(source: Midi, transport: typeof Tone.Transport): void {
    this.source = source;
    this.transport = transport;
  }

  getTimeSignature(): [number, number] {
    const timeSignature = this.source?.header.timeSignatures[0]?.timeSignature;
    return timeSignature ? [timeSignature[0], timeSignature[1]] : [4, 4];
  }

  getBeatsPerMinute(): number {
    return Math.round(this.source?.header.tempos[0]?.bpm ?? 120);
  }

  getCurrentTime(): number {
    return this.transport.seconds;
  }

  getTotalLength(): number {
    return this.source?.duration ?? 0;
  }

  getTQuarter(): number {
    return 60 / this.getBeatsPerMinute();
  }

  getTMeasure(): number {
    const tQuarter = this.getTQuarter();
    const timeSignature = this.getTimeSignature();
    return tQuarter * (timeSignature[0] / (4 / timeSignature[1]));
  }

  getTotalMeasures(): number {
    return Math.ceil(this.getTotalLength() / this.getTMeasure());
  }

  getMeasuresForTrack(track: Track): Measure[] {
    const measures = Array.from(
      { length: this.getTotalMeasures() },
      () => [] as any,
    );

    const tMeasure = this.getTMeasure();

    for (const note of track.notes) {
      const measureIndex = Math.floor(note.time / tMeasure);
      const relativeStart = note.time % tMeasure;

      const calculatedDuration =
        note.duration > tMeasure ? tMeasure - relativeStart : note.duration;

      measures[measureIndex].push({
        note: note.name,
        pitch: note.midi,
        startTime: relativeStart,
        duration: calculatedDuration,
      });
    }

    return measures.map((measure, index) => ({
      index,
      notes: measure,
    }));
  }

  getCurrentMeasure(): number {
    return Math.floor(this.getCurrentTime() / this.getTMeasure());
  }
}

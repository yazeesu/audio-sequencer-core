import {
  MusicalNote,
  BASE_A_FREQUENCY,
  NOTE_TO_SEMITONE_MAP,
  SEMITONE_TO_NOTE_MAP,
} from "../constants";
import { InvalidMidiError, InvalidNoteError } from "../errors";
import { PitchName } from "../types";

export function validateMidi(midi: number): boolean {
  return midi >= 0 && midi <= 127;
}

export function validateNote(note: PitchName): boolean {
  return /^[A-G]#?$/.test(note);
}

export function noteToMidi(note: PitchName): number {
  if (!validateNote(note)) throw new InvalidNoteError(note);

  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new InvalidNoteError(note);

  const [, pitch, octaveStr] = match as [string, MusicalNote, string];
  const octave = parseInt(octaveStr, 10);

  return (octave + 1) * 12 + NOTE_TO_SEMITONE_MAP[pitch];
}

export function midiToNote(midi: number): PitchName {
  if (!validateMidi(midi)) throw new InvalidMidiError(midi);

  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const pitch = SEMITONE_TO_NOTE_MAP[semitone];

  if (!pitch) throw new InvalidMidiError(midi);

  return `${pitch}${octave}`;
}

export function noteToFrequency(note: PitchName): number {
  return midiToFrequency(noteToMidi(note));
}

export function midiToFrequency(midi: number): number {
  return BASE_A_FREQUENCY * Math.pow(2, (midi - 69) / 12);
}

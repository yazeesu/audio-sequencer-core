/**
 * The notes of the chromatic scale.
 */
export enum MusicalNote {
  C = "C",
  CSharp = "C#", // Or D bemol
  D = "D",
  DSharp = "D#", // Or E bemol
  E = "E",
  F = "F",
  FSharp = "F#", // Or G bemol
  G = "G",
  GSharp = "G#", // Or A bemol
  A = "A",
  ASharp = "A#", // Or B bemol
  B = "B",
}

/**
 * Notes repeat every 12 semitones.
 */
export const NOTE_TO_SEMITONE_MAP: Record<MusicalNote, number> = {
  [MusicalNote.C]: 0,
  [MusicalNote.CSharp]: 1,
  [MusicalNote.D]: 2,
  [MusicalNote.DSharp]: 3,
  [MusicalNote.E]: 4,
  [MusicalNote.F]: 5,
  [MusicalNote.FSharp]: 6,
  [MusicalNote.G]: 7,
  [MusicalNote.GSharp]: 8,
  [MusicalNote.A]: 9,
  [MusicalNote.ASharp]: 10,
  [MusicalNote.B]: 11,
};

export const SEMITONE_TO_NOTE_MAP: Record<number, MusicalNote> = {
  0: MusicalNote.C,
  1: MusicalNote.CSharp,
  2: MusicalNote.D,
  3: MusicalNote.DSharp,
  4: MusicalNote.E,
  5: MusicalNote.F,
  6: MusicalNote.FSharp,
  7: MusicalNote.G,
  8: MusicalNote.GSharp,
  9: MusicalNote.A,
  10: MusicalNote.ASharp,
  11: MusicalNote.B,
};

export const BASE_A_FREQUENCY = 440;

import { MusicalNote } from "@/src/core/music/constants";

export const NATURAL_NOTES = [
  MusicalNote.C,
  MusicalNote.D,
  MusicalNote.E,
  MusicalNote.F,
  MusicalNote.G,
  MusicalNote.A,
  MusicalNote.B,
] as const;

const SHARP_AFTER: Record<(typeof NATURAL_NOTES)[number], string | null> = {
  [MusicalNote.C]: MusicalNote.CSharp,
  [MusicalNote.D]: MusicalNote.DSharp,
  [MusicalNote.E]: null,
  [MusicalNote.F]: MusicalNote.FSharp,
  [MusicalNote.G]: MusicalNote.GSharp,
  [MusicalNote.A]: MusicalNote.ASharp,
  [MusicalNote.B]: null,
};

export type PianoBlackKey = {
  note: string;
  afterWhiteIndex: number;
};

export type PianoLayout = {
  whiteKeys: string[];
  blackKeys: PianoBlackKey[];
};

/**
 *
 * @param startOctave - The octave to start at.
 * @param octaveCount - The number of octaves to create.
 * @returns A piano layout with the given number of octaves.
 */
export function createPianoLayout(
  startOctave: number,
  octaveCount: number,
): PianoLayout {
  const whiteKeys: string[] = [];
  const blackKeys: PianoBlackKey[] = [];

  for (let o = 0; o < octaveCount; o++) {
    const octave = startOctave + o;
    for (const natural of NATURAL_NOTES) {
      const whiteIndex = whiteKeys.length;
      whiteKeys.push(`${natural}${octave}`);

      const sharpPitch = SHARP_AFTER[natural];
      if (sharpPitch) {
        blackKeys.push({
          note: `${sharpPitch}${octave}`,
          afterWhiteIndex: whiteIndex,
        });
      }
    }
  }

  return { whiteKeys, blackKeys };
}

export function blackKeyLeftPercent(
  afterWhiteIndex: number,
  whiteKeyCount: number,
): number {
  return ((afterWhiteIndex + 1) / whiteKeyCount) * 100;
}

export function blackKeyWidthPercent(whiteKeyCount: number): number {
  return (100 / whiteKeyCount) * 0.62;
}

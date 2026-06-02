export class InvalidNoteError extends Error {
  constructor(note: string) {
    super(`Invalid note: ${note}`);
    this.name = "InvalidNoteError";
  }
}

export class InvalidMidiError extends Error {
  constructor(midi: number) {
    super(`Invalid MIDI: ${midi}`);
    this.name = "InvalidMidiError";
  }
}

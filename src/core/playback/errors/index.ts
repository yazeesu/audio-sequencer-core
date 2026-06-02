/**
 * This error is thrown when an error occurs during the playback of a MIDI file.
 */
export class PlaybackError extends Error {
  constructor(
    message: string,
    public readonly reason: string,
  ) {
    super(message);
    console.error(this.name, this.message);
  }
}

/**
 * This error is thrown when trying to play a MIDI file without loading it first.
 */
export class PlaybackSourceLoadError extends Error {
  constructor(
    message: string,
    public readonly reason: string,
  ) {
    super(message);
    console.error(this.name, this.message);
  }
}

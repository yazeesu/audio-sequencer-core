import { injectable } from "tsyringe";
import { Midi } from "@tonejs/midi";
import axios from "axios";
import { tryCatch } from "@/src/shared/utils";
import { PlaybackSourceLoadError } from "@/src/core/playback/errors";

@injectable()
export class MIDIPlaybackSourceLoader {
  constructor() {}

  async load(path: string): Promise<Midi> {
    const [result, error] = await tryCatch<ArrayBuffer, Error>(
      axios
        .get<ArrayBuffer>(path, {
          responseType: "arraybuffer",
        })
        .then((res) => res.data),
    );

    if (error) {
      throw new PlaybackSourceLoadError(
        "Failed to load MIDI file",
        error.message,
      );
    }

    return new Midi(result);
  }
}

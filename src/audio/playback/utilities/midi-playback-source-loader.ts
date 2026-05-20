import { injectable } from "tsyringe";
import { Midi } from "@tonejs/midi";
import { AudioPlayerSourceLoadResult } from "../core";
import axios from "axios";
import { MIDISourceError } from "../errors";

@injectable()
export class MIDIPlaybackSourceLoader {
  constructor() {}

  async load(source: string): Promise<AudioPlayerSourceLoadResult<Midi>> {
    try {
      const { data } = await axios.get<ArrayBuffer>(source, {
        responseType: "arraybuffer",
      });
      const midi = new Midi(data);

      return {
        success: true,
        data: midi,
        source,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorText = `Failed to fetch MIDI file. ${error.response?.status}`;
        const e = new MIDISourceError(
          errorText,
          `HTTP error: ${error.response?.status}`,
        );
        return {
          success: false,
          error: e,
          reason: e.message,
        };
      }
      const e =
        error instanceof Error
          ? error
          : new MIDISourceError("Failed to fetch MIDI file", "Unknown error");
      return {
        success: false,
        error: e,
        reason: e.message,
      };
    }
  }
}

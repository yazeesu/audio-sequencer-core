import {
  LoadablePlaybackEngine,
  ObservablePlaybackEngine,
  PlaybackEngine,
  PlaybackEngineWithInstruments,
  TempoAwarePlaybackEngine,
} from "@/src/core/playback/interfaces";
import { Midi } from "@tonejs/midi";

export enum MIDIPlaybackEngineEvents {
  TIME_SIGNATURE_CHANGED = "time-signature-changed",
  BEATS_PER_MINUTE_CHANGED = "beats-per-minute-changed",
  TOTAL_LENGTH_CHANGED = "total-length-changed",
  CURRENT_TIME_CHANGED = "current-time-changed",
}

export type MIDIPlaybackEngineEventMap = {
  [MIDIPlaybackEngineEvents.TIME_SIGNATURE_CHANGED]: [number, number];
  [MIDIPlaybackEngineEvents.BEATS_PER_MINUTE_CHANGED]: number;
  [MIDIPlaybackEngineEvents.TOTAL_LENGTH_CHANGED]: number;
  [MIDIPlaybackEngineEvents.CURRENT_TIME_CHANGED]: number;
};

export interface MIDIPlaybackEngineInterface
  extends
    PlaybackEngine,
    LoadablePlaybackEngine<Midi>,
    TempoAwarePlaybackEngine,
    PlaybackEngineWithInstruments,
    ObservablePlaybackEngine<MIDIPlaybackEngineEventMap> {}

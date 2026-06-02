import { MIDIPlaybackEngine } from "@/src/infrastructure/playback/midi/midi-playback-engine";
import { PlaybackStateMachineLoadSessionFn } from "./create-playback-state-machine";
import { SongData } from "@/src/shared/types";
import {
  InstrumentRegistries,
  instrumentRegistries,
} from "@/src/infrastructure/instruments";

export type MIDIPlaybackSessionTrack = {
  id: number | string;
  name: string;
  instrument: { family: string; name: string };
  notesLength: number;
};

export type MIDIPlaybackSessionMetadata = {
  beatsPerMinute: number;
  timeSignature: [number, number];
  totalLength: number;
  durationOfQuarter: number;
  durationOfMeasure: number;
  totalMeasures: number;
};

export type MIDIPlaybackSessionData = {
  playableTracks: MIDIPlaybackSessionTrack[];
  currentTrackIndex: number | null;
};

export const loadMIDIPlaybackSession: PlaybackStateMachineLoadSessionFn<
  MIDIPlaybackEngine,
  MIDIPlaybackSessionMetadata,
  MIDIPlaybackSessionData
> = async (engine, song) => {
  registerInstrumentsFromSong(engine, song);

  const midiPath = song.sources?.midi ?? "";
  const result = await engine.load(midiPath);

  if (!result?.success) {
    throw result.error;
  }

  const metadata = buildMetadata(engine);
  const data = buildPlaybackData(engine);

  return { metadata, data };
};

function registerInstrumentsFromSong(
  engine: MIDIPlaybackEngine,
  song: SongData,
): void {
  engine.clearInstruments();

  for (const [trackKey, track] of Object.entries(song.tracks ?? {})) {
    const factory =
      instrumentRegistries[track.instrument.engine as InstrumentRegistries];
    if (!factory) {
      console.warn(
        `No instrument for track ${trackKey}: ${track.instrument.engine}`,
      );
      continue;
    }
    engine.registerInstrument(trackKey, factory());
  }
}

function buildMetadata(
  engine: MIDIPlaybackEngine,
): MIDIPlaybackSessionMetadata {
  return {
    beatsPerMinute: engine.getBeatsPerMinute(),
    timeSignature: engine.getTimeSignature(),
    totalLength: engine.getTotalLength(),
    durationOfQuarter: engine.getDurationOfQuarter(),
    durationOfMeasure: engine.getDurationOfMeasure(),
    totalMeasures: engine.getTotalMeasures(),
  };
}

function buildPlaybackData(
  engine: MIDIPlaybackEngine,
): MIDIPlaybackSessionData {
  const playableTracks =
    engine.getSource()?.tracks.map((track, index) => ({
      id: index,
      name: track.name,
      instrument: {
        family: track.instrument.family,
        name: track.instrument.name,
      },
      notesLength: track.notes.length,
    })) ?? [];

  const currentTrackIndex = playableTracks[0]?.id ?? null;

  return { playableTracks, currentTrackIndex };
}

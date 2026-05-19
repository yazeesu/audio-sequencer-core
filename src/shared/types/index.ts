export type SongSource = "audio" | "midi";

export type SongTrackData = {
  id: number | string;
  name: string;
  instrument: {
    engine: string;
    family: string;
    name: string;
  };
  volume: number;
  isMuted: boolean;
};

export type SongData = {
  id: number | string;
  title: string;
  artist: string;
  sources: Record<SongSource, string>;
  tracks: Record<string, SongTrackData>;
};

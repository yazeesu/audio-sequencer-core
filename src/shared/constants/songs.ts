import { SongData } from "../types";

export const SONGS_DATA: SongData[] = [
  {
    id: "imagine-dragons-radioactive",
    title: "Radioactive",
    artist: "Imagine Dragons",
    sources: {
      audio: "",
      midi: "/songs/radioactive.mid",
    },
    tracks: {
      "0": {
        id: "0",
        name: "Melody",
        instrument: {
          engine: "tinpots-piano",
          family: "piano",
          name: "bright acoustic piano",
        },
        volume: 1,
        isMuted: false,
      },
      "2": {
        id: "2",
        name: "Bass",
        instrument: {
          engine: "synth-bass-guitar",
          family: "bass",
          name: "electric bass (finger)",
        },
        volume: 1,
        isMuted: false,
      },
      "4": {
        id: "3",
        name: "Acoustic Guitar",
        instrument: {
          engine: "bread-bread-overdriven-guitar",
          family: "guitar",
          name: "acoustic guitar (nylon)",
        },
        volume: 1,
        isMuted: false,
      },
    },
  },
];

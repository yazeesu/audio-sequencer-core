import "reflect-metadata";
import { PlayableInstrument } from "@/src/core/audio/interfaces";
import { SynthBassInstrument } from "./bass-guitar/synth-bass-guitar";
import { SynthRetroPianoInstrument } from "./piano/synth-retro-piano";
import { TinpotsV3PianoInstrument } from "./piano/tinpots-v3-piano";
import { BreadBreadOverdrivenGuitarInstrument } from "./overdriven-guitar/bread-bread-overdriven-guitar";

export enum InstrumentRegistries {
  SYNTH_BASS_GUITAR = "synth-bass-guitar",
  SYNTH_RETRO_PIANO = "synth-retro-piano",
  BREAD_BREAD_OVERDRIVEN_GUITAR = "bread-bread-overdriven-guitar",
  TINPOTS_PIANO = "tinpots-piano",
}

export type InstrumentRegistry = {
  [key in InstrumentRegistries]: () => PlayableInstrument;
};

export const instrumentRegistries: InstrumentRegistry = {
  [InstrumentRegistries.SYNTH_BASS_GUITAR]: () => new SynthBassInstrument(),
  [InstrumentRegistries.SYNTH_RETRO_PIANO]: () =>
    new SynthRetroPianoInstrument(),
  [InstrumentRegistries.BREAD_BREAD_OVERDRIVEN_GUITAR]: () =>
    new BreadBreadOverdrivenGuitarInstrument(),
  [InstrumentRegistries.TINPOTS_PIANO]: () => new TinpotsV3PianoInstrument(),
};

export * from "./bass-guitar/synth-bass-guitar";
export * from "./overdriven-guitar/bread-bread-overdriven-guitar";
export * from "./piano/synth-retro-piano";
export * from "./piano/tinpots-v3-piano";

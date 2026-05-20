import { InstrumentAudioEngine } from "../core";
import { BreadBreadOverdrivenGuitarInstrument } from "./bread-bread-overdriven-guitar";
import { SynthBassInstrument } from "./synth-bass-guitar";
import { SynthRetroPianoInstrument } from "./synth-retro-piano";
import { TinpotsPianoInstrument } from "./tinpots-piano";

export enum InstrumentRegistries {
  SYNTH_BASS_GUITAR = "synth-bass-guitar",
  SYNTH_RETRO_PIANO = "synth-retro-piano",
  BREAD_BREAD_OVERDRIVEN_GUITAR = "bread-bread-overdriven-guitar",
  TINPOTS_PIANO = "tinpots-piano",
}

export type InstrumentRegistry = {
  [key in InstrumentRegistries]: () => InstrumentAudioEngine;
};

export const instrumentRegistries: InstrumentRegistry = {
  [InstrumentRegistries.SYNTH_BASS_GUITAR]: () => new SynthBassInstrument(),
  [InstrumentRegistries.SYNTH_RETRO_PIANO]: () =>
    new SynthRetroPianoInstrument(),
  [InstrumentRegistries.BREAD_BREAD_OVERDRIVEN_GUITAR]: () =>
    new BreadBreadOverdrivenGuitarInstrument(),
  [InstrumentRegistries.TINPOTS_PIANO]: () => new TinpotsPianoInstrument(),
};

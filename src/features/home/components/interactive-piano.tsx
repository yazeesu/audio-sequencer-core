"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";
import SimplePiano from "@/src/instruments/simple-piano/simple-piano";
import { createPianoLayout } from "@/src/piano/layout";
import { InstrumentAudioEngine } from "@/src/audio/core";
import { TinpotsPianoInstrument } from "@/src/audio/instruments/tinpots-piano";

const pianoLayout = createPianoLayout(4, 2);

export function InteractivePiano() {
  const audioEngine = useRef<InstrumentAudioEngine | null>(null);

  useEffect(() => {
    const instrument = new TinpotsPianoInstrument();

    audioEngine.current = {
      playNote: async (options) => {
        await Tone.start();
        return instrument.playNote(options);
      },
      muteNote: (options) => instrument.muteNote(options),
    };

    return () => {
      instrument.dispose();
      audioEngine.current = null;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-xl">
      <SimplePiano
        audioEngine={audioEngine}
        layout={pianoLayout}
        showNoteNames={false}
        showNoteMidi={false}
      >
        <SimplePiano.SimplePianoKeyboard
          renderWhiteKey={(note, style) => (
            <SimplePiano.StandardWhiteKey key={note} note={note} style={style} />
          )}
          renderBlackKey={(note, style) => (
            <SimplePiano.StandardBlackKey key={note} note={note} style={style} />
          )}
        />
      </SimplePiano>
    </div>
  );
}

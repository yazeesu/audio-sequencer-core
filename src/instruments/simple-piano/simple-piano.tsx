"use client";

import { cn } from "@/lib/utils";
import { InstrumentAudioEngine } from "@/src/audio/core";
import {
  convertMIDIToFrequency,
  convertNoteToMIDI,
  KEYBOARD_MAPS,
  Notes,
} from "@/src/audio/theory";
import {
  blackKeyLeftPercent,
  blackKeyWidthPercent,
  PianoBlackKey,
  PianoLayout,
} from "@/src/piano/layout";
import React, {
  createContext,
  CSSProperties,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SimplePianoProps = {
  audioEngine: RefObject<InstrumentAudioEngine | null>;
  layout: PianoLayout;
  showNoteNames?: boolean;
  showNoteMidi?: boolean;
} & React.ComponentPropsWithoutRef<"div">;

type SimplePianoContextType = {
  audioEngine: RefObject<InstrumentAudioEngine | null>;
  layout: PianoLayout;
  whiteKeys: string[];
  blackKeys: PianoBlackKey[];
  whiteKeyCount: number;
  blackKeyCount: number;
  whiteKeyWidth: number;
  blackKeyWidth: number;
  showNoteNames?: boolean;
  showNoteMidi?: boolean;
  layoutNotes: ReadonlySet<string>;
  pressedNotes: ReadonlySet<string>;
  pressNote: (note: string) => void;
  releaseNote: (note: string) => void;
};

const SimplePianoContext = createContext<SimplePianoContextType | null>(null);

function useSimplePiano() {
  const context = useContext(SimplePianoContext);
  if (!context) {
    throw new Error("useSimplePiano must be used within a SimplePiano");
  }
  return context;
}

function resolveKeyboardNote(key: string, octave: number): string | null {
  if (key === "ı") {
    return `${Notes.C}${octave + 1}`;
  }

  const pitch = KEYBOARD_MAPS[key.toLowerCase()];
  return pitch ? `${pitch}${octave}` : null;
}

function useSimplePianoKey(note: string) {
  const { audioEngine, pressedNotes, pressNote, releaseNote } =
    useSimplePiano();
  const midi = useMemo(() => convertNoteToMIDI(note), [note]);
  const frequency = useMemo(() => convertMIDIToFrequency(midi), [midi]);
  const isPressed = pressedNotes.has(note);

  const handlePlayNote = useCallback(() => {
    if (!audioEngine.current) {
      console.warn(
        "Couldn't play the note since no instrument audio engine is provided.",
      );
      return;
    }

    pressNote(note);
    void audioEngine.current.playNote({ note });
  }, [audioEngine, note, pressNote]);

  const handleMuteNote = useCallback(() => {
    if (!audioEngine.current) {
      console.warn(
        "Couldn't mute the note since no instrument audio engine is provided.",
      );
      return;
    }

    releaseNote(note);
    void audioEngine.current.muteNote({ note });
  }, [audioEngine, note, releaseNote]);

  return { midi, frequency, isPressed, handlePlayNote, handleMuteNote };
}

function SimplePiano({
  audioEngine,
  layout,
  showNoteNames = true,
  showNoteMidi = true,
  children,
  ...props
}: SimplePianoProps) {
  const { whiteKeys, blackKeys } = layout;
  const [pressedNotes, setPressedNotes] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const whiteKeyCount = whiteKeys.length;
  const blackKeyCount = blackKeys.length;

  const whiteKeyWidth = 100 / whiteKeyCount;
  const blackKeyWidth = blackKeyWidthPercent(whiteKeyCount);

  const layoutNotes = useMemo(() => {
    const notes = new Set<string>();
    whiteKeys.forEach((key) => notes.add(key));
    blackKeys.forEach(({ note }) => notes.add(note));
    return notes;
  }, [whiteKeys, blackKeys]);

  const pressNote = useCallback((note: string) => {
    setPressedNotes((prev) => {
      if (prev.has(note)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(note);
      return next;
    });
  }, []);

  const releaseNote = useCallback((note: string) => {
    setPressedNotes((prev) => {
      if (!prev.has(note)) {
        return prev;
      }

      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }, []);

  return (
    <SimplePianoContext.Provider
      value={{
        audioEngine,
        layout,
        whiteKeys,
        blackKeys,
        whiteKeyCount,
        blackKeyCount,
        whiteKeyWidth,
        blackKeyWidth,
        showNoteNames,
        showNoteMidi,
        layoutNotes,
        pressedNotes,
        pressNote,
        releaseNote,
      }}
    >
      <div className="relative w-full select-none" {...props}>
        {children}
      </div>
    </SimplePianoContext.Provider>
  );
}

type SimplePianoKeyboardProps = {
  renderWhiteKey: (note: string, style: CSSProperties) => React.ReactNode;
  renderBlackKey: (note: string, style: CSSProperties) => React.ReactNode;
};

SimplePiano.SimplePianoKeyboard = function SimplePianoKeyboard({
  renderWhiteKey,
  renderBlackKey,
}: SimplePianoKeyboardProps) {
  const {
    audioEngine,
    whiteKeys,
    blackKeys,
    whiteKeyCount,
    whiteKeyWidth,
    blackKeyWidth,
    layoutNotes,
    pressNote,
    releaseNote,
  } = useSimplePiano();

  const keyboardOctave = useMemo(() => {
    const match = whiteKeys[0]?.match(/(\d+)$/);
    return match ? Number(match[1]) : 4;
  }, [whiteKeys]);

  useEffect(() => {
    const keyboardPressed = new Set<string>();

    const playKeyboardNote = (note: string) => {
      if (!layoutNotes.has(note) || keyboardPressed.has(note)) {
        return;
      }

      keyboardPressed.add(note);
      pressNote(note);
      void audioEngine.current?.playNote({ note });
    };

    const muteKeyboardNote = (note: string) => {
      if (!keyboardPressed.has(note)) {
        return;
      }

      keyboardPressed.delete(note);
      releaseNote(note);
      void audioEngine.current?.muteNote({ note });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      const note = resolveKeyboardNote(e.key, keyboardOctave);
      if (!note) return;

      playKeyboardNote(note);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      const note = resolveKeyboardNote(e.key, keyboardOctave);
      if (!note) return;

      muteKeyboardNote(note);
    };

    const onBlur = () => {
      keyboardPressed.forEach((note) => {
        releaseNote(note);
        void audioEngine.current?.muteNote({ note });
      });
      keyboardPressed.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [audioEngine, keyboardOctave, layoutNotes, pressNote, releaseNote]);

  return (
    <React.Fragment>
      <div className="flex flex-row gap-px rounded-b-lg overflow-hidden shadow-lg">
        {whiteKeys.map((note) => (
          <React.Fragment key={note}>
            {renderWhiteKey(note, { width: `${whiteKeyWidth}%` })}
          </React.Fragment>
        ))}
      </div>

      {blackKeys.map(({ note, afterWhiteIndex }) => (
        <React.Fragment key={note}>
          {renderBlackKey(note, {
            left: `${blackKeyLeftPercent(afterWhiteIndex, whiteKeyCount)}%`,
            width: `${blackKeyWidth}%`,
          })}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

type StandartPianoKeyProps = {
  note: string;
  style?: CSSProperties;
};

SimplePiano.StandardWhiteKey = function StandardWhiteKey({
  note,
  style,
}: StandartPianoKeyProps) {
  const { showNoteNames, showNoteMidi } = useSimplePiano();
  const { midi, isPressed, handlePlayNote, handleMuteNote } =
    useSimplePianoKey(note);

  return (
    <button
      type="button"
      className={cn(
        "relative z-0 flex-1 h-44 border flex flex-col items-center justify-end pb-3 rounded-b-sm transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-400 hover:cursor-pointer",
        isPressed
          ? "border-violet-300/80 bg-linear-to-b from-violet-100 to-violet-200 shadow-[inset_0_2px_8px_rgba(124,58,237,0.25)]"
          : "border-neutral-200 bg-linear-to-b from-white to-[#e8e4f0] hover:from-[#f8f6fc] hover:to-[#ddd8ea] active:from-[#ebe6f4] active:to-[#cfc9dc]",
      )}
      style={style}
      onMouseDown={handlePlayNote}
      onMouseUp={handleMuteNote}
      onMouseLeave={handleMuteNote}
    >
      {showNoteNames && !!note && (
        <span
          className={cn(
            "text-xs font-medium",
            isPressed ? "text-violet-600" : "text-neutral-500",
          )}
        >
          {note}
        </span>
      )}
      {showNoteMidi && !!midi && (
        <span
          className={cn(
            "text-[10px] tabular-nums",
            isPressed ? "text-violet-500" : "text-neutral-400",
          )}
        >
          {midi}
        </span>
      )}
    </button>
  );
};

SimplePiano.StandardBlackKey = function StandardBlackKey({
  note,
  style,
}: StandartPianoKeyProps) {
  const { showNoteNames, showNoteMidi } = useSimplePiano();
  const { midi, isPressed, handlePlayNote, handleMuteNote } =
    useSimplePianoKey(note);

  return (
    <button
      type="button"
      className={cn(
        "absolute top-0 z-10 h-[60%] -translate-x-1/2 rounded-b-md border shadow-md flex flex-col items-center justify-end pb-2 transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 hover:cursor-pointer",
        isPressed
          ? "border-violet-400/70 bg-linear-to-b from-violet-400 to-violet-700 shadow-[0_0_12px_rgba(124,58,237,0.55),inset_0_1px_4px_rgba(255,255,255,0.2)]"
          : "border-neutral-800 bg-linear-to-b from-neutral-700 to-neutral-950 hover:from-neutral-600 hover:to-neutral-900 active:from-neutral-800 active:to-black",
      )}
      style={style}
      onMouseDown={handlePlayNote}
      onMouseUp={handleMuteNote}
      onMouseLeave={handleMuteNote}
    >
      {showNoteNames && !!note && (
        <span
          className={cn(
            "text-[10px] font-medium",
            isPressed ? "text-violet-100" : "text-neutral-400",
          )}
        >
          {note}
        </span>
      )}
      {showNoteMidi && !!midi && (
        <span
          className={cn(
            "text-[9px] tabular-nums",
            isPressed ? "text-violet-200" : "text-neutral-500",
          )}
        >
          {midi}
        </span>
      )}
    </button>
  );
};

export default SimplePiano;

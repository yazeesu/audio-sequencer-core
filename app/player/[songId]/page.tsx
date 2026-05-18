"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useMIDIPlayer } from "@/src/player/hooks/use-midi-player";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine";

export default function SongPlayerPage() {
  const { songId } = useParams<{ songId: string }>();
  const songSource = useMemo(() => `/songs/${songId}.mid`, [songId]);

  const { state, engineRef, playableTracks, handlePlay, handleStop } =
    useMIDIPlayer(songSource);

  const targetTrack = useMemo(() => {
    if (state.value === "idle" || state.value === "loading") return null;
    if (!playableTracks.length) return null;
    return engineRef.current?.getSource()?.tracks[75];
  }, [state.value, playableTracks]);

  useEffect(() => {
    if (!engineRef.current) return;
    const midiEngine = engineRef.current as MIDIPlaybackEngine;

    const observeCurrentTime = (currentTime: number) => {
      console.log("currentTime", currentTime);
    };

    midiEngine.subscribe("current-time-changed", observeCurrentTime);

    return () => {
      midiEngine.unsubscribe("current-time-changed", observeCurrentTime);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-16">
      <h1>{songSource}</h1>
      <div className="flex items-center gap-4">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handleStop}>Stop</button>
        <p>Status : {state.value}</p>
      </div>
      <pre>
        <code>{JSON.stringify(playableTracks, null, 2)}</code>
      </pre>
    </div>
  );
}

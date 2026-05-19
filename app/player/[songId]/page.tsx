"use client";

import { useParams } from "next/navigation";
import React, { FC, useMemo, useState, useSyncExternalStore } from "react";
import { useMIDIPlayer } from "@/src/player/hooks/use-midi-player";
import {
  MIDIPlaybackEngine,
  MIDIPlaybackEngineEvents,
} from "@/src/audio/playback/engine";
import { Track } from "@tonejs/midi";
import { Measure } from "@/src/audio/playback/core";

export default function SongPlayerPage() {
  const { songId } = useParams<{ songId: string }>();
  const songSource = useMemo(() => `/songs/${songId}.mid`, [songId]);

  const [currentTrack, setCurrentTrack] = useState<number | null>(null);

  const { state, engineRef, playableTracks, handlePlay, handleStop } =
    useMIDIPlayer(songSource);

  const targetTrack = useMemo(() => {
    if (state.value === "idle" || state.value === "loading") return null;
    if (!playableTracks.length) return null;
    return engineRef.current?.getSource()?.tracks[currentTrack ?? 0];
  }, [state.value, playableTracks, currentTrack]);

  return (
    <div className="flex flex-col gap-4 p-16">
      <h1>{songSource}</h1>
      <div className="flex items-center gap-4">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handleStop}>Stop</button>
        <p>Status : {state.value}</p>
      </div>
      <div className="flex flex-col gap-4">
        <p>Tracks</p>
        {playableTracks.map((track) => (
          <button key={track.id} onClick={() => setCurrentTrack(track.id)}>
            {track.id} - {track.instrument.family} - {track.instrument.name}
          </button>
        ))}
      </div>
      {engineRef.current && targetTrack && (
        <TrackVisualizer
          engineRef={engineRef as React.RefObject<MIDIPlaybackEngine>}
          track={targetTrack}
        />
      )}
      <pre>
        <code>{JSON.stringify(playableTracks, null, 2)}</code>
      </pre>
    </div>
  );
}

type TrackVisualizerProps = {
  engineRef: React.RefObject<MIDIPlaybackEngine | null>;
  track: Track;
};

function TrackVisualizer({ engineRef, track }: TrackVisualizerProps) {
  const currentTime = useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      engineRef.current?.subscribe(
        MIDIPlaybackEngineEvents.CURRENT_TIME_CHANGED,
        handler,
      );
      return () => {
        engineRef.current?.unsubscribe(
          MIDIPlaybackEngineEvents.CURRENT_TIME_CHANGED,
          handler,
        );
      };
    },
    () => engineRef.current?.getCurrentTime() ?? 0,
    () => 0,
  );

  const currentMeasureIndex = useMemo(() => {
    return Math.floor(currentTime / (engineRef.current?.getTMeasure() ?? 0));
  }, [currentTime]);

  const trackerProgressPercent = useMemo(() => {
    return (
      ((currentTime % (engineRef.current?.getTMeasure() ?? 0)) /
        (engineRef.current?.getTMeasure() ?? 0)) *
      100
    );
  }, [currentTime]);

  const measures = useMemo(() => {
    if (!engineRef.current) return [];
    return engineRef.current.getMeasuresForTrack(track);
  }, [track]);

  return (
    <div className="grid grid-cols-4 border border-slate-600 rounded-md overflow-x-hidden">
      {measures.map((measure) => (
        <MeasureLine
          key={`measure-line-${measure.index}`}
          measure={measure}
          tQuarter={engineRef.current?.getTQuarter() ?? 0}
          tMeasure={engineRef.current?.getTMeasure() ?? 0}
          isPlaying={currentMeasureIndex === measure.index}
          trackerLeftPercent={trackerProgressPercent}
        />
      ))}
    </div>
  );
}

type MeasureLineProps = {
  measure: Measure;
  tQuarter: number;
  tMeasure: number;
  isPlaying?: boolean;
  trackerLeftPercent?: number;
};

function MeasureLine({
  measure,
  tQuarter,
  tMeasure,
  isPlaying = false,
  trackerLeftPercent = 0,
}: MeasureLineProps) {
  return (
    <div className="relative border-b border-l border-slate-600 h-16 flex items-center">
      {measure.notes.map((note, index) => (
        <NoteTimeline
          key={`note-timeline-${note.note}-${index}`}
          note={note.note}
          pitch={note.pitch}
          startTime={note.startTime}
          duration={note.duration}
          leftPercent={(note.startTime / tMeasure) * 100}
          widthPercent={(note.duration / tMeasure) * 100}
        />
      ))}
      {isPlaying && <MeasureTracker leftPercent={trackerLeftPercent} />}
    </div>
  );
}

const MeasureTracker: FC<{ leftPercent?: number }> = React.memo(
  ({ leftPercent = 0 }) => {
    return (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-100"
        style={{ left: `${leftPercent}%` }}
      />
    );
  },
);

type NoteTimelineProps = {
  note: string;
  pitch: number;
  startTime: number;
  duration: number;

  leftPercent: number;
  widthPercent: number;
};

const NoteTimeline: FC<NoteTimelineProps> = React.memo(
  ({ leftPercent, widthPercent, note }) => {
    return (
      <div
        className="absolute flex items-center p-2 bg-emerald-700 rounded-lg z-99"
        style={{
          left: `${leftPercent}%`,
          width: `max(${widthPercent}%, 8px)`,
        }}
      >
        <p className="text-xs">{note}</p>
      </div>
    );
  },
);

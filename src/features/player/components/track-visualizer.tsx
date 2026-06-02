import { Measure } from "@/src/audio/playback/core";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine/midi-playback-engine";
import { Track } from "@tonejs/midi";
import React, { FC, useMemo } from "react";
import { useAudioPlaybackTime } from "../hooks/use-audio-playback-time";

const GRID_COLUMNS = 4;
const MEASURE_ROW_HEIGHT_REM = 4;

type TrackVisualizerProps = {
  playbackEngine: MIDIPlaybackEngine;
  observedTrack: Track;
  isPlaying: boolean;
};

export default function TrackVisualizer({
  playbackEngine,
  observedTrack,
  isPlaying,
}: TrackVisualizerProps) {
  const gridData = useMemo(
    () => ({
      measures: playbackEngine.getMeasuresForTrack(observedTrack),
      tMeasure: playbackEngine.getTMeasure(),
    }),
    [playbackEngine, observedTrack],
  );

  return (
    <div className="relative border border-slate-600 rounded-md overflow-x-hidden">
      <MeasureGrid
        measures={gridData.measures}
        tMeasure={gridData.tMeasure}
        columns={GRID_COLUMNS}
      />
      <PlaybackCursor
        playbackEngine={playbackEngine}
        isPlaying={isPlaying}
        tMeasure={gridData.tMeasure}
        columns={GRID_COLUMNS}
        rowHeightRem={MEASURE_ROW_HEIGHT_REM}
      />
    </div>
  );
}

type MeasureGridProps = {
  measures: Measure[];
  tMeasure: number;
  columns: number;
};

const MeasureGrid = React.memo(function MeasureGrid({
  measures,
  tMeasure,
  columns,
}: MeasureGridProps) {
  return (
    <div
      className="grid border-slate-600 overflow-x-hidden"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {measures.map((measure) => (
        <MeasureLine
          key={`measure-line-${measure.index}`}
          measure={measure}
          tMeasure={tMeasure}
        />
      ))}
    </div>
  );
});

type MeasureLineProps = {
  measure: Measure;
  tMeasure: number;
};

const MeasureLine = React.memo(function MeasureLine({
  measure,
  tMeasure,
}: MeasureLineProps) {
  return (
    <div className="relative border-b border-l border-slate-600 h-16 flex items-center">
      {measure.notes.map((note, index) => (
        <NoteTimeline
          key={`note-timeline-${note.note}-${index}`}
          note={note.note}
          leftPercent={(note.startTime / tMeasure) * 100}
          widthPercent={(note.duration / tMeasure) * 100}
        />
      ))}
    </div>
  );
});

type PlaybackCursorProps = {
  playbackEngine: MIDIPlaybackEngine;
  isPlaying: boolean;
  tMeasure: number;
  columns: number;
  rowHeightRem: number;
};

function PlaybackCursor({
  playbackEngine,
  isPlaying,
  tMeasure,
  columns,
  rowHeightRem,
}: PlaybackCursorProps) {
  const currentTime = useAudioPlaybackTime(playbackEngine, isPlaying);

  const measureIndex = Math.floor(currentTime / tMeasure);
  const progressPercent = ((currentTime % tMeasure) / tMeasure) * 100;

  const col = measureIndex % columns;
  const row = Math.floor(measureIndex / columns);
  const colWidthPercent = 100 / columns;
  const left =
    col * colWidthPercent + (progressPercent / 100) * colWidthPercent;

  if (!isPlaying) return null;

  return (
    <div
      className="absolute w-0.5 bg-red-500 pointer-events-none z-100"
      style={{
        left: `${left}%`,
        top: `${row * rowHeightRem}rem`,
        height: `${rowHeightRem}rem`,
      }}
    />
  );
}

type NoteTimelineProps = {
  note: string;
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

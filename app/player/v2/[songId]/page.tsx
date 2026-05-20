"use client";

import { useParams } from "next/navigation";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine";
import { useQuery } from "@tanstack/react-query";
import { songsRequestService } from "@/src/shared/services/http/requests";
import { useAudioPlaybackEngine } from "@/src/player/hooks/use-audio-playback-engine";
import TrackVisualizer from "@/src/player/components/track-visualizer";

export default function SongPlayerPage() {
  const { songId } = useParams<{ songId: string }>();
  const { data: song } = useQuery({
    queryKey: ["song", songId],
    queryFn: () => songsRequestService.getSong(songId),
    enabled: !!songId,
  });

  const {
    status,
    context,
    playbackEngineRef,
    currentTrack,
    handlePlay,
    handlePause,
    handleStop,
    handleUpdateTrack,
  } = useAudioPlaybackEngine(song);

  const engine = playbackEngineRef.current as MIDIPlaybackEngine | null;

  return (
    <div className="flex flex-col gap-4 p-16">
      <h1>
        {song?.artist} - {song?.title}
      </h1>
      <div className="flex flex-col gap-2">
        <p>Beats per minute: {context.metadata?.beatsPerMinute}</p>
        <p>
          Time signature: {context.metadata?.timeSignature[0]}/
          {context.metadata?.timeSignature[1]}
        </p>
        <p>Total length: {context.metadata?.totalLength}</p>
        <p>Duration of quarter: {context.metadata?.durationOfQuarter}</p>
        <p>Duration of measure: {context.metadata?.durationOfMeasure}</p>
        <p>Total measures: {context.metadata?.totalMeasures}</p>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
        <p>Status : {status}</p>
      </div>
      <div className="flex flex-col gap-4">
        <p>Tracks</p>
        {context.playableTracks?.map((track) => (
          <button key={track.id} onClick={() => handleUpdateTrack(track.id)}>
            {track.id} - {track.instrument.family} - {track.instrument.name}
          </button>
        ))}
      </div>
      {engine && currentTrack && context.metadata && (
        <TrackVisualizer
          playbackEngine={engine}
          observedTrack={currentTrack}
          isPlaying={status === "playing"}
        />
      )}
      <pre>
        <code>{JSON.stringify(context.playableTracks, null, 2)}</code>
      </pre>
    </div>
  );
}

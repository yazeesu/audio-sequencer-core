"use client";

import { useParams } from "next/navigation";
import { MIDIPlaybackEngine } from "@/src/audio/playback/engine/midi-playback-engine";
import { useQuery } from "@tanstack/react-query";
import { songsRequestService } from "@/src/shared/services/http/requests";
import { useAudioPlaybackEngine } from "@/src/player/hooks/use-audio-playback-engine";
import TrackVisualizer from "@/src/player/components/track-visualizer";
import { tailwind } from "@/src/shared/utils/tailwind";

export default function SongPlayerPage() {
  const { songId } = useParams<{ songId: string }>();
  const { data: song } = useQuery({
    queryKey: ["song", songId],
    queryFn: () => songsRequestService.getSong(songId),
    enabled: !!songId,
  });

  const {
    state,
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
      <h1 className="text-2xl font-bold">
        {song?.artist} - {song?.title}
      </h1>
      <div className="flex items-center gap-4">
        <button
          className="bg-emerald-600 w-[144px] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-emerald-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePlay}
        >
          Play
        </button>
        <button
          className="bg-amber-600 w-[144px] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-amber-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePause}
        >
          Pause
        </button>
        <button
          className="bg-red-600 w-[144px] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-red-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleStop}
        >
          Stop
        </button>
        <p>Status : {status}</p>
      </div>

      <div className="flex flex-col gap-2 my-6">
        <h3 className="text-lg font-bold">Tracks</h3>
        <div className="grid grid-cols-5 gap-2">
          {context.playableTracks
            ?.filter((track) => track.notesLength > 0)
            .map((track) => (
              <button
                key={track.id}
                className={tailwind(
                  "basis-sm flex justify-start bg-slate-600 py-2 pl-6 rounded-md hover:cursor-pointer hover:bg-slate-500 transition-colors duration-150",
                  context.currentTrackIndex === track.id &&
                    "bg-emerald-600 hover:bg-emerald-500",
                )}
                onClick={() => handleUpdateTrack(track.id)}
              >
                {track.id} - {track.instrument.family} - {track.instrument.name}
              </button>
            ))}
        </div>
      </div>

      {engine && currentTrack && context.metadata && (
        <TrackVisualizer
          playbackEngine={engine}
          observedTrack={currentTrack}
          isPlaying={state.matches("playing") || state.matches("paused")}
        />
      )}
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { songsRequestService } from "@/src/shared/services/http/requests";
import { useAudioPlaybackEngine } from "@/src/adapters/react/hooks/use-audio-playback-engine";
import { tailwind } from "@/src/shared/utils/tailwind";

export default function SongPlayerPage() {
  const { songId } = useParams<{ songId: string }>();
  const { data: song } = useQuery({
    queryKey: ["song", songId],
    queryFn: () => songsRequestService.getSong(songId),
    enabled: !!songId,
  });

  const { status, isPlaying, isReady, handlePlay, handlePause, handleStop } =
    useAudioPlaybackEngine(song);

  // const {
  //   state,
  //   status,
  //   context,
  //   playbackEngineRef,
  //   currentTrack,
  //   handlePlay,
  //   handlePause,
  //   handleStop,
  //   handleUpdateTrack,
  // } = useAudioPlaybackEngine(song);

  // const engine = playbackEngineRef.current as MIDIPlaybackEngine | null;
  // const isPlaying = state.matches("playing");

  // const pianoRollRef = useRef<PianoRollRef>(null);

  // const audioTime = useAudioPlaybackTime(
  //   playbackEngineRef.current as MIDIPlaybackEngine | null,
  //   isPlaying,
  // );

  // const midiNotes = useMemo(
  //   () =>
  //     currentTrack?.notes.map((note, index) => ({
  //       id: `${currentTrack.instrument.name}-${note.midi}-${note.time}-${index}`,
  //       pitch: note.midi,
  //       start: note.time,
  //       duration: note.duration,
  //       velocity: note.velocity,
  //     })) ?? [],
  //   [currentTrack],
  // );

  // useEffect(() => {
  //   pianoRollRef.current?.updateNotes(midiNotes);
  // }, [midiNotes]);

  // useEffect(() => {
  //   console.log("audioTime", audioTime);
  //   pianoRollRef.current?.updateScroll(audioTime);
  // }, [audioTime]);

  // useEffect(() => {
  //   if (isPlaying) return;
  //   const t = engine?.getCurrentTime() ?? 0;
  //   pianoRollRef.current?.updateScroll(t);
  // }, [isPlaying, engine]);

  return (
    <div className="flex flex-col gap-4 p-16">
      <h1 className="text-2xl font-bold">
        {song?.artist} - {song?.title}
      </h1>
      <div className="flex items-center gap-4">
        <button
          className={tailwind(
            "bg-emerald-600 w-[144px] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-emerald-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
            !isPlaying && "bg-emerald-600 hover:bg-emerald-500",
          )}
          disabled={!isReady}
          onClick={handlePlay}
        >
          Play
        </button>
        <button
          className="bg-amber-600 w-[144px] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-amber-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
          onClick={handlePause}
        >
          Pause
        </button>
        <button
          className="bg-red-600 w-[144px] text-white px-4 py-2 rounded-md hover:cursor-pointer hover:bg-red-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
          onClick={handleStop}
        >
          Stop
        </button>
        <p>Status : {status}</p>
      </div>

      <div className="flex flex-col gap-2 my-6">
        <h3 className="text-lg font-bold">Tracks</h3>
        {/* <div className="grid grid-cols-5 gap-2">
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
              >
                {track.id} - {track.instrument.family} - {track.instrument.name}
              </button>
            ))}
        </div> */}
      </div>
    </div>
  );
}

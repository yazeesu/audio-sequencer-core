"use client";

import { songsRequestService } from "@/src/shared/services/http/requests";
import { SongData } from "@/src/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function PlayerV2Page() {
  const { data } = useQuery({
    queryKey: ["songs"],
    queryFn: () => songsRequestService.getSongs(),
  });

  return (
    <div className="w-screen min-h-screen p-16">
      <div className="flex flex-wrap gap-6">
        {data?.map((song: SongData) => (
          <SongCard
            key={song.id}
            id={song.id.toString()}
            name={song.title}
            artist={song.artist}
          />
        ))}
      </div>
    </div>
  );
}

type SongCardProps = {
  id: string;
  name: string;
  artist: string;
};

function SongCard({ id, name, artist }: SongCardProps) {
  const router = useRouter();
  const handleNavigate = () => {
    router.push(`/player/v2/${id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="flex flex-col items-center gap-2 hover:cursor-pointer"
    >
      <figure className="size-48 min-size-48 rounded-md bg-slate-600 mb-4" />
      <p>{name}</p>
      <p>{artist}</p>
    </div>
  );
}

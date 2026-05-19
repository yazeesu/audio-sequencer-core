import { SONGS_DATA } from "@/src/shared/constants/songs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ songId: string }> },
) {
  const { songId } = await context.params;
  const targetSong = SONGS_DATA.find((song) => song.id === songId);

  if (!targetSong) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }
  return NextResponse.json(targetSong);
}

import { SONGS_DATA } from "@/src/shared/constants/songs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(SONGS_DATA);
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ conversations: [] });
}

export async function POST() {
  return NextResponse.json({ message: "Conversations endpoint stub" }, { status: 200 });
}

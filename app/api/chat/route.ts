import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Full implementation in feature build
  const { messages } = await req.json();
  void messages;
  return NextResponse.json({ message: "Chat endpoint stub" }, { status: 200 });
}

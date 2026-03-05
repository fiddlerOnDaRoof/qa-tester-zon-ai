import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ projects: [] });
}

export async function POST() {
  return NextResponse.json({ message: "Projects endpoint stub" }, { status: 200 });
}

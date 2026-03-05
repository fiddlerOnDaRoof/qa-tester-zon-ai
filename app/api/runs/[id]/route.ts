import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ run: null });
}

export async function PATCH() {
  return NextResponse.json({ message: "Run update stub" }, { status: 200 });
}

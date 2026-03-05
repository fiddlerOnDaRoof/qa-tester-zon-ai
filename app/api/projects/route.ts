import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { dbTable } from "@/lib/dbTable";
import { CreateProjectSchema } from "@/src/features/create-project-with-url/lib/validation";
import { randomUUID } from "crypto";

export async function GET() {
  const requestId = randomUUID();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[GET /api/projects]", { requestId, error: "Unauthorized" });
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(dbTable("projects"))
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/projects]", { requestId, userId: user.id, error: error.message });
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[POST /api/projects]", { requestId, error: "Unauthorized" });
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, target_url } = parsed.data;

  const { data, error } = await supabase
    .from(dbTable("projects"))
    .insert({ user_id: user.id, name, target_url })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/projects]", { requestId, userId: user.id, error: error.message });
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  console.log("[POST /api/projects]", { requestId, userId: user.id, projectId: data.id });
  return NextResponse.json({ data, error: null }, { status: 201 });
}

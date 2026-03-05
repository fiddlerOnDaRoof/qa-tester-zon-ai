import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dbTable } from "@/lib/dbTable";
import { randomUUID } from "crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[GET /api/projects/:id/runs]", { requestId, error: "Unauthorized" });
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns the project
  const { data: project, error: projErr } = await supabaseAdmin
    .from(dbTable("projects"))
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projErr || !project) {
    console.error("[GET /api/projects/:id/runs]", { requestId, userId: user.id, projectId, error: "Project not found" });
    return NextResponse.json({ data: null, error: "Project not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from(dbTable("test_runs"))
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[GET /api/projects/:id/runs]", { requestId, userId: user.id, projectId, error: error.message });
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], error: null });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const { id: projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[POST /api/projects/:id/runs]", { requestId, error: "Unauthorized" });
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns the project
  const { data: project, error: projErr } = await supabaseAdmin
    .from(dbTable("projects"))
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ data: null, error: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }

  const { mode, instructions } = body as { mode?: string; instructions?: string };

  if (!mode || !["full", "targeted"].includes(mode)) {
    return NextResponse.json({ data: null, error: "Invalid mode. Must be 'full' or 'targeted'" }, { status: 400 });
  }

  if (mode === "targeted" && !instructions?.trim()) {
    return NextResponse.json({ data: null, error: "Instructions required for targeted mode" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from(dbTable("test_runs"))
    .insert({
      project_id: projectId,
      user_id: user.id,
      mode,
      instructions: instructions?.trim() || null,
      status: "pending",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/projects/:id/runs]", { requestId, userId: user.id, projectId, error: error.message });
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  console.log("[POST /api/projects/:id/runs]", { requestId, userId: user.id, projectId, runId: data.id });
  return NextResponse.json({ data, error: null }, { status: 201 });
}

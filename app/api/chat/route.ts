import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dbTable } from "@/lib/dbTable";
import { streamChat } from "@/lib/ai/adapter";
import { z } from "zod";
import { randomUUID } from "crypto";

function createSupabaseFromRequest(req: NextRequest) {
  const response = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  return { supabase, response };
}

const BodySchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10_000),
});

const SYSTEM_PROMPT = `You are QA Tester AI — a professional, knowledgeable, and approachable AI quality assurance assistant. You help users test their web and mobile PWA applications by analyzing features, identifying potential bugs, planning test strategies, and providing actionable guidance.

Your capabilities include:
- Discussing testing strategies, methodologies, and best practices
- Planning test cases and test suites for web/mobile features
- Analyzing bug reports and suggesting root causes and fixes
- Guiding users through manual and automated testing workflows
- Helping users create and manage testing projects

Communication style: Professional yet fun. Be direct and specific. Use technical language when appropriate but keep explanations clear. Show enthusiasm for quality and reliability.`;

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const { supabase } = createSupabaseFromRequest(req);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { conversationId, message } = parsed.data;

    // Verify conversation belongs to user
    const { data: convo, error: convoErr } = await supabaseAdmin
      .from(dbTable("conversations"))
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convoErr || !convo) {
      console.error("[chat] conversation not found", { requestId, userId: user.id, conversationId });
      return NextResponse.json(
        { data: null, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Insert user message
    const { error: insertErr } = await supabaseAdmin
      .from(dbTable("messages"))
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
        meta_json: null,
      });

    if (insertErr) {
      console.error("[chat] failed to insert user message", { requestId, error: insertErr.message });
      return NextResponse.json(
        { data: null, error: "Failed to save message" },
        { status: 500 }
      );
    }

    // Load conversation history (last 50 messages for context window)
    const { data: history } = await supabaseAdmin
      .from(dbTable("messages"))
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(50);

    const aiMessages = (history ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Stream AI response
    const aiStream = await streamChat(aiMessages, SYSTEM_PROMPT);

    // Create a transform stream that captures content for DB insertion
    let fullContent = "";
    const transform = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        fullContent += new TextDecoder().decode(chunk);
        controller.enqueue(chunk);
      },
      async flush() {
        // Insert assistant message after stream completes
        const { error: assistantErr } = await supabaseAdmin
          .from(dbTable("messages"))
          .insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullContent,
            meta_json: { requestId },
          });
        if (assistantErr) {
          console.error("[chat] failed to insert assistant message", {
            requestId,
            error: assistantErr.message,
          });
        }
      },
    });

    const responseStream = aiStream.pipeThrough(transform);

    console.log("[chat] streaming response", { requestId, userId: user.id, conversationId });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Request-Id": requestId,
      },
    });
  } catch (err) {
    console.error("[chat] unexpected error", { requestId, error: err });
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

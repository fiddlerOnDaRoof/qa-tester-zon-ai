import { supabase } from "@/lib/supabaseClient";
import { dbTable } from "@/lib/dbTable";
import type { Conversation, Message } from "@/types";

/** Fetch all conversations for the current user, newest first. */
export async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from(dbTable("conversations"))
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Create a new conversation. */
export async function createConversation(title: string): Promise<Conversation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from(dbTable("conversations"))
    .insert({ user_id: user.id, title })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Fetch messages for a conversation, oldest first. */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from(dbTable("messages"))
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Send a user message and stream the AI response. Returns a ReadableStream of text chunks. */
export async function sendMessage(
  conversationId: string,
  message: string
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, message }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `Chat request failed (${res.status})`);
  }

  if (!res.body) throw new Error("No response stream");
  return res.body;
}

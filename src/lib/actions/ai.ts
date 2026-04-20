"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tiptapJsonToMarkdown } from "@/lib/tiptap-to-markdown";
import {
  generateSessionSummary,
  checkOllamaConnection as checkConnection,
} from "@/lib/ai";
import type { JSONContent } from "@tiptap/react";

/**
 * Generate an AI summary for a session and save it to the database.
 */
export async function generateAndSaveSummary(
  sessionId: string
): Promise<string> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { notesBody: true },
  });

  if (!session) throw new Error("Session not found.");
  if (!session.notesBody) throw new Error("Session has no notes to summarize.");

  const markdown = tiptapJsonToMarkdown(session.notesBody as JSONContent);
  if (!markdown.trim()) throw new Error("Session notes are empty.");

  const summary = await generateSessionSummary(markdown);

  await prisma.session.update({
    where: { id: sessionId },
    data: { summary },
  });

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/dashboard");

  return summary;
}

/**
 * Check Ollama connectivity (used by settings page).
 */
export async function checkOllamaStatus() {
  return checkConnection();
}

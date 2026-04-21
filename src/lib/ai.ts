const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:12b";

const SESSION_SUMMARY_SYSTEM = `You are a concise summarizer for a tabletop RPG campaign journal written from a player's perspective. You will receive campaign context (character info, relevant NPCs, locations) followed by session notes. Produce a summary of 3-5 bullet points. Each bullet should be one sentence capturing a key event, discovery, or decision. Use the correct names for characters, NPCs, and locations from the context provided. Write in past tense, third person. Use plain text with no markdown formatting. Do not add commentary, analysis, or speculation beyond what the notes describe.`;

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

interface OllamaTagsResponse {
  models: Array<{ name: string; size: number; modified_at: string }>;
}

/**
 * Call Ollama's generate endpoint (non-streaming).
 */
async function ollamaGenerate(
  prompt: string,
  system: string
): Promise<string> {
  const url = `${OLLAMA_URL}/api/generate`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        system,
        stream: false,
      }),
    });
  } catch {
    throw new Error(
      `Cannot connect to Ollama at ${OLLAMA_URL}. Make sure Ollama is running on your server.`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama returned ${res.status}: ${body}`);
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  return data.response.trim();
}

/**
 * Generate a summary of session notes with campaign context.
 */
export async function generateSessionSummary(
  notesMarkdown: string,
  context: string
): Promise<string> {
  if (!notesMarkdown.trim()) {
    throw new Error("No notes to summarize.");
  }

  const prompt = context
    ? `--- CAMPAIGN CONTEXT ---\n${context}\n\n--- SESSION NOTES ---\n${notesMarkdown}`
    : notesMarkdown;

  return ollamaGenerate(prompt, SESSION_SUMMARY_SYSTEM);
}

/**
 * Check if Ollama is reachable and return available model info.
 */
export async function checkOllamaConnection(): Promise<{
  connected: boolean;
  url: string;
  model: string;
  modelAvailable: boolean;
}> {
  const result = {
    connected: false,
    url: OLLAMA_URL,
    model: OLLAMA_MODEL,
    modelAvailable: false,
  };

  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return result;

    result.connected = true;
    const data = (await res.json()) as OllamaTagsResponse;
    result.modelAvailable = data.models.some(
      (m) => m.name === OLLAMA_MODEL || m.name.startsWith(`${OLLAMA_MODEL}:`)
    );
    return result;
  } catch {
    return result;
  }
}

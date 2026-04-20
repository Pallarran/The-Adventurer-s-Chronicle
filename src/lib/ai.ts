const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:14b";

const SESSION_SUMMARY_SYSTEM = `You are a concise note summarizer for a tabletop RPG campaign journal. Given session notes, produce a summary of 3-5 bullet points. Each bullet should be one sentence capturing a key event, discovery, or decision. Use plain text, no markdown formatting. Do not add commentary or analysis — just summarize what happened. /no_think`;

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
async function ollamaGenerate(prompt: string, system: string): Promise<string> {
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
  } catch (err) {
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
 * Generate a 3-5 bullet point summary of session notes.
 */
export async function generateSessionSummary(
  notesMarkdown: string
): Promise<string> {
  if (!notesMarkdown.trim()) {
    throw new Error("No notes to summarize.");
  }

  return ollamaGenerate(notesMarkdown, SESSION_SUMMARY_SYSTEM);
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

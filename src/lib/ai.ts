const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "Dnd-Summarizer";

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

interface OllamaTagsResponse {
  models: Array<{ name: string; size: number; modified_at: string }>;
}

/**
 * Call Ollama's generate endpoint (non-streaming).
 * System prompt is expected to be baked into the model's Modelfile.
 */
async function ollamaGenerate(prompt: string): Promise<string> {
  const url = `${OLLAMA_URL}/api/generate`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
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
 * Generate a summary of session notes using the configured Ollama model.
 */
export async function generateSessionSummary(
  notesMarkdown: string
): Promise<string> {
  if (!notesMarkdown.trim()) {
    throw new Error("No notes to summarize.");
  }

  return ollamaGenerate(notesMarkdown);
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

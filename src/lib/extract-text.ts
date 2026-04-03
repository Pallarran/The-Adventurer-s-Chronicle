/** Recursively extract plain text from a Tiptap JSONContent tree. */
export function extractTextFromJson(
  json: unknown,
  maxLength: number = 120
): string {
  if (!json || typeof json !== "object") return "";
  const node = json as { text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    let result = "";
    for (const child of node.content) {
      result += extractTextFromJson(child, maxLength);
      if (result.length >= maxLength) break;
    }
    return result;
  }
  return "";
}

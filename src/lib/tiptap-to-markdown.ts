import type { JSONContent } from "@tiptap/react";

/** Convert a Tiptap ProseMirror JSON document to Markdown. */
export function tiptapJsonToMarkdown(
  doc: JSONContent | null | undefined
): string {
  if (!doc || !doc.content) return "";
  return renderBlocks(doc.content, 0).trimEnd() + "\n";
}

// ---------------------------------------------------------------------------
// Block-level rendering
// ---------------------------------------------------------------------------

function renderBlocks(nodes: JSONContent[], depth: number): string {
  return nodes.map((n) => renderBlock(n, depth)).join("");
}

function renderBlock(node: JSONContent, depth: number): string {
  switch (node.type) {
    case "paragraph":
      return renderInline(node.content) + "\n\n";

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const prefix = "#".repeat(level);
      return `${prefix} ${renderInline(node.content)}\n\n`;
    }

    case "bulletList":
      return (
        (node.content ?? [])
          .map((item) => renderListItem(item, "- ", depth))
          .join("") + (depth === 0 ? "\n" : "")
      );

    case "orderedList":
      return (
        (node.content ?? [])
          .map((item, i) => renderListItem(item, `${i + 1}. `, depth))
          .join("") + (depth === 0 ? "\n" : "")
      );

    case "taskList":
      return (
        (node.content ?? [])
          .map((item) => renderTaskItem(item, depth))
          .join("") + (depth === 0 ? "\n" : "")
      );

    case "blockquote": {
      const inner = renderBlocks(node.content ?? [], depth).trimEnd();
      return (
        inner
          .split("\n")
          .map((line) => (line.length > 0 ? `> ${line}` : ">"))
          .join("\n") + "\n\n"
      );
    }

    case "codeBlock": {
      const lang = (node.attrs?.language as string) ?? "";
      const code = (node.content ?? []).map((c) => c.text ?? "").join("");
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }

    case "horizontalRule":
      return "---\n\n";

    case "image": {
      const src = (node.attrs?.src as string) ?? "";
      const alt = (node.attrs?.alt as string) ?? "";
      return `![${alt}](${src})\n\n`;
    }

    default:
      // Unknown block — try to render children
      if (node.content) return renderBlocks(node.content, depth);
      return "";
  }
}

// ---------------------------------------------------------------------------
// List helpers
// ---------------------------------------------------------------------------

function renderListItem(
  node: JSONContent,
  marker: string,
  depth: number
): string {
  const indent = "  ".repeat(depth);
  const children = node.content ?? [];
  let result = "";

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (
      child.type === "bulletList" ||
      child.type === "orderedList" ||
      child.type === "taskList"
    ) {
      // Nested list — render at increased depth
      result += renderBlock(child, depth + 1);
    } else if (child.type === "paragraph") {
      if (i === 0) {
        result += `${indent}${marker}${renderInline(child.content)}\n`;
      } else {
        // Additional paragraphs within same list item
        result += `${indent}  ${renderInline(child.content)}\n`;
      }
    } else {
      result += renderBlock(child, depth);
    }
  }

  return result;
}

function renderTaskItem(node: JSONContent, depth: number): string {
  const checked = !!(node.attrs?.checked);
  const marker = checked ? "- [x] " : "- [ ] ";
  return renderListItem(node, marker, depth);
}

// ---------------------------------------------------------------------------
// Inline rendering
// ---------------------------------------------------------------------------

function renderInline(content: JSONContent[] | undefined): string {
  if (!content) return "";
  return content.map(renderInlineNode).join("");
}

function renderInlineNode(node: JSONContent): string {
  if (node.type === "text") {
    return applyMarks(node.text ?? "", node.marks);
  }
  if (node.type === "mention") {
    const label = (node.attrs?.label as string) || (node.attrs?.id as string) || "";
    return `@${label}`;
  }
  if (node.type === "hardBreak") {
    return "\n";
  }
  // Fallback — render children inline
  return renderInline(node.content);
}

// ---------------------------------------------------------------------------
// Mark application
// ---------------------------------------------------------------------------

interface Mark {
  type: string;
  attrs?: Record<string, unknown>;
}

function applyMarks(text: string, marks?: Mark[]): string {
  if (!marks || marks.length === 0) return text;
  let result = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = `**${result}**`;
        break;
      case "italic":
        result = `*${result}*`;
        break;
      case "strike":
        result = `~~${result}~~`;
        break;
      case "code":
        result = `\`${result}\``;
        break;
      case "link":
        result = `[${result}](${(mark.attrs?.href as string) ?? ""})`;
        break;
    }
  }
  return result;
}

"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Mention from "@tiptap/extension-mention";
import { cn } from "@/lib/utils";
import { FormGuardContext } from "@/components/layout/form-guard-provider";
import type { JSONContent } from "@tiptap/react";

// Map mention types to their detail page paths
const mentionHrefMap: Record<string, (id: string) => string> = {
  npc: (id) => `/npcs/${id}`,
  location: (id) => `/locations/${id}`,
  organization: (id) => `/organizations/${id}`,
  item: (id) => `/items/${id}`,
  quest: (id) => `/quests/${id}`,
};

interface RichTextDisplayProps {
  content?: JSONContent | null;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-arcane-teal underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-md max-w-full" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Mention.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            mentionType: {
              default: null,
              parseHTML: (element: HTMLElement) => element.getAttribute("data-mention-type"),
              renderHTML: (attributes: Record<string, unknown>) => {
                if (!attributes.mentionType) return {};
                return { "data-mention-type": attributes.mentionType };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: "mention",
        },
        renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
      }),
    ],
    content: content ?? undefined,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none",
      },
    },
  });

  const router = useRouter();
  const { requestNavigation } = useContext(FormGuardContext);

  // Make mention nodes clickable (client-side navigation)
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const mention = target.closest("[data-type='mention']") as HTMLElement | null;
    if (mention) {
      const id = mention.getAttribute("data-id");
      const type = mention.getAttribute("data-mention-type");
      if (id && type && mentionHrefMap[type]) {
        const href = mentionHrefMap[type](id);
        if (requestNavigation(href)) {
          router.push(href);
        }
      }
    }
  };

  if (!content) {
    return (
      <p className={cn("text-sm text-muted-foreground italic", className)}>
        No content yet.
      </p>
    );
  }

  return (
    <div className={className} onClick={handleClick}>
      <EditorContent editor={editor} />
    </div>
  );
}

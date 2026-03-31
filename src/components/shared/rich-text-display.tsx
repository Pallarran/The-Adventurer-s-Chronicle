"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { cn } from "@/lib/utils";
import type { JSONContent } from "@tiptap/react";

interface RichTextDisplayProps {
  content?: JSONContent | null;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  const editor = useEditor({
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
    ],
    content: content ?? undefined,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none",
      },
    },
  });

  if (!content) {
    return (
      <p className={cn("text-sm text-muted-foreground italic", className)}>
        No content yet.
      </p>
    );
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}

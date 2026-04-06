"use client";

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Plus,
  Users,
  MapPin,
  Shield,
  Package,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import type { JSONContent } from "@tiptap/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";

// ---------- Mention suggestion types ----------
interface MentionSuggestion {
  id: string;
  name: string;
  type: "npc" | "location" | "organization" | "item";
}

// ---------- Mention suggestion list component ----------
interface MentionListProps {
  items: MentionSuggestion[];
  command: (item: { id: string; label: string; mentionType: string }) => void;
  query: string;
}

interface MentionListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const ENTITY_TYPES = [
  { key: "npc" as const, label: "NPC", icon: Users },
  { key: "location" as const, label: "Location", icon: MapPin },
  { key: "organization" as const, label: "Organization", icon: Shield },
  { key: "item" as const, label: "Item", icon: Package },
];

const typeLabel: Record<string, string> = {
  npc: "NPC",
  location: "Location",
  organization: "Org",
  item: "Item",
};

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command, query }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<"search" | "create">("search");
    const [createName, setCreateName] = useState(query);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Reset selection when items change (new query results)
    useEffect(() => {
      setSelectedIndex(0);
      setMode("search");
    }, [items]);

    // Sync createName when query changes while in search mode
    useEffect(() => {
      if (mode === "search") setCreateName(query);
    }, [query, mode]);

    // Auto-focus name input when entering create mode
    useEffect(() => {
      if (mode === "create") {
        // Small delay to let the DOM update before focusing
        requestAnimationFrame(() => nameInputRef.current?.focus());
      }
    }, [mode]);

    const handleCreate = useCallback(
      async (type: "npc" | "location" | "organization" | "item") => {
        const name = createName.trim();
        if (!name) {
          setError("Name is required");
          return;
        }
        setIsCreating(true);
        setError(null);
        try {
          const res = await fetch("/api/mentions/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, type }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Failed to create entity");
          }
          const created: { id: string; name: string; type: string } = await res.json();
          command({ id: created.id, label: created.name, mentionType: created.type });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Creation failed");
        } finally {
          setIsCreating(false);
        }
      },
      [createName, command]
    );

    const selectItem = useCallback(
      (index: number) => {
        if (index < items.length) {
          const item = items[index];
          if (item) {
            command({ id: item.id, label: item.name, mentionType: item.type });
          }
        } else {
          // "Create new" row selected
          setMode("create");
          setSelectedIndex(0);
        }
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (mode === "create") {
          // In create mode, let the focused input/buttons handle keys
          return false;
        }

        // Search mode: navigate items + create row
        const total = items.length + 1;
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + total - 1) % total);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % total);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    // ── Create mode UI ──
    if (mode === "create") {
      return (
        <div className="min-w-[240px] rounded-lg border border-border bg-popover p-1 shadow-md">
          <div className="px-2 py-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value);
                setError(null);
              }}
              className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setMode("search");
                  setSelectedIndex(items.length);
                } else if (e.key === "Enter" && !isCreating) {
                  e.preventDefault();
                  handleCreate(ENTITY_TYPES[selectedIndex].key);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedIndex((i) => Math.min(i + 1, ENTITY_TYPES.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedIndex((i) => Math.max(i - 1, 0));
                }
              }}
              disabled={isCreating}
            />
          </div>
          <div className="mx-1 my-1 h-px bg-border" />
          <div className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Type
          </div>
          {ENTITY_TYPES.map((type, index) => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent/50"
                )}
                onClick={() => handleCreate(type.key)}
                type="button"
                disabled={isCreating}
              >
                {isCreating && index === selectedIndex ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span>{type.label}</span>
              </button>
            );
          })}
          {error && (
            <p className="px-2 py-1 text-xs text-destructive">{error}</p>
          )}
        </div>
      );
    }

    // ── Search mode UI ──
    return (
      <div className="rounded-lg border border-border bg-popover p-1 shadow-md">
        {items.length === 0 && (
          <span className="block px-2 py-1 text-xs text-muted-foreground">No results</span>
        )}
        {items.map((item, index) => (
          <button
            key={item.id}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-accent/50"
            )}
            onClick={() => selectItem(index)}
            type="button"
          >
            <span className="flex-1">{item.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {typeLabel[item.type]}
            </span>
          </button>
        ))}
        {items.length > 0 && <div className="mx-1 my-1 h-px bg-border" />}
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
            selectedIndex === items.length
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50"
          )}
          onClick={() => selectItem(items.length)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create {query ? `"${query}"` : "new"}...</span>
        </button>
      </div>
    );
  }
);
MentionList.displayName = "MentionList";

// ---------- Mention suggestion config ----------
const mentionSuggestion = {
  items: async ({ query }: { query: string }): Promise<MentionSuggestion[]> => {
    try {
      const res = await fetch(`/api/mentions?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },
  render: () => {
    let component: ReactRenderer<MentionListRef> | null = null;
    let popup: TippyInstance[] | null = null;

    return {
      onStart: (props: SuggestionProps<MentionSuggestion>) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate: (props: SuggestionProps<MentionSuggestion>) => {
        component?.updateProps(props);
        if (popup && props.clientRect) {
          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

// ---------- Main editor component ----------
interface RichTextEditorProps {
  content?: JSONContent | null;
  onChange?: (content: JSONContent) => void;
  placeholder?: string;
  className?: string;
  minimal?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
  minimal = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-arcane-teal underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-md max-w-full" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
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
        suggestion: mentionSuggestion,
      }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => {
      // Deep-clone to strip ProseMirror internal references/prototypes that
      // the React flight protocol can't serialize correctly (causes attrs to
      // be dropped from mention nodes).
      onChange?.(JSON.parse(JSON.stringify(editor.getJSON())));
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm max-w-none ${minimal ? "min-h-[80px]" : "min-h-[150px]"} px-4 py-3 focus:outline-none`,
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background overflow-hidden",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        {!minimal && (
          <>
            <div className="mx-1 h-5 w-px bg-border" />

            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 2 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              aria-label="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 3 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              aria-label="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Toggle>
          </>
        )}

        <div className="mx-1 h-5 w-px bg-border" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        {!minimal && (
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        )}
        <Toggle
          size="sm"
          pressed={editor.isActive("taskList")}
          onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
          aria-label="Task List"
        >
          <ListChecks className="h-4 w-4" />
        </Toggle>

        {!minimal && (
          <>
            <div className="mx-1 h-5 w-px bg-border" />

            <Toggle
              size="sm"
              pressed={editor.isActive("blockquote")}
              onPressedChange={() =>
                editor.chain().focus().toggleBlockquote().run()
              }
              aria-label="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={false}
              onPressedChange={() =>
                editor.chain().focus().setHorizontalRule().run()
              }
              aria-label="Horizontal Rule"
            >
              <Minus className="h-4 w-4" />
            </Toggle>

            <div className="mx-1 h-5 w-px bg-border" />

            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
              onPressedChange={addLink}
              aria-label="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={false}
              onPressedChange={addImage}
              aria-label="Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Toggle>
          </>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

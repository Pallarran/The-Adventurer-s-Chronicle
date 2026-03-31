"use client";

import { useState, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface TagOption {
  id: string;
  name: string;
}

interface TagInputProps {
  availableTags: TagOption[];
  selectedTags: TagOption[];
  onChange: (tags: TagOption[]) => void;
  onCreateTag?: (name: string) => Promise<TagOption>;
}

export function TagInput({
  availableTags,
  selectedTags,
  onChange,
  onCreateTag,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = availableTags.filter(
    (tag) =>
      !selectedTags.some((s) => s.id === tag.id) &&
      tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = availableTags.some(
    (t) => t.name.toLowerCase() === search.toLowerCase()
  );
  const alreadySelected = selectedTags.some(
    (t) => t.name.toLowerCase() === search.toLowerCase()
  );
  const showCreate =
    search.trim() && !exactMatch && !alreadySelected && onCreateTag;

  const add = useCallback(
    (tag: TagOption) => {
      onChange([...selectedTags, tag]);
      setSearch("");
    },
    [selectedTags, onChange]
  );

  const remove = useCallback(
    (id: string) => {
      onChange(selectedTags.filter((t) => t.id !== id));
    },
    [selectedTags, onChange]
  );

  const create = useCallback(async () => {
    if (!onCreateTag || !search.trim()) return;
    setCreating(true);
    try {
      const newTag = await onCreateTag(search.trim());
      add(newTag);
    } finally {
      setCreating(false);
    }
  }, [onCreateTag, search, add]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Tags</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className={cn(buttonVariants({variant: "outline", size: "sm"}), "h-7 gap-1")}>
              <Plus className="h-3 w-3" />
              Add Tag
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or create..."
              className="h-8 text-sm mb-2"
            />
            <ScrollArea className="max-h-36">
              <div className="space-y-0.5">
                {filtered.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => add(tag)}
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    {tag.name}
                  </button>
                ))}
                {showCreate && (
                  <button
                    onClick={create}
                    disabled={creating}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gold hover:bg-accent"
                  >
                    <Plus className="h-3 w-3" />
                    Create &quot;{search.trim()}&quot;
                  </button>
                )}
                {filtered.length === 0 && !showCreate && (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    No tags found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="outline" className="gap-1 pr-1">
              {tag.name}
              <button
                onClick={() => remove(tag.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

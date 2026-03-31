"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploadProps {
  value?: string | null;
  onChange: (path: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        onChange(data.path);
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        upload(file);
      }
    },
    [upload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
    },
    [upload]
  );

  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
          <Image
            src={`/api/upload/${value}`}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute -right-2 -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onChange(null)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-6 transition-colors cursor-pointer",
        dragOver && "border-gold bg-gold/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploading ? (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      ) : (
        <>
          <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop an image here or click to browse
          </p>
        </>
      )}
    </div>
  );
}

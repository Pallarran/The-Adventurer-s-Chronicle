"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Move } from "lucide-react";

interface ImageWithCropProps {
  src: string;
  alt: string;
  entityId: string;
  positionY: number;
  onSave: (id: string, positionY: number) => Promise<void>;
}

export function ImageWithCrop({
  src,
  alt,
  entityId,
  positionY: initialPosY,
  onSave,
}: ImageWithCropProps) {
  const safeInitial = Number.isFinite(initialPosY) ? initialPosY : 50;
  const [adjusting, setAdjusting] = useState(false);
  const [posY, setPosY] = useState(safeInitial);
  const [dragging, setDragging] = useState(false);
  const [, startTransition] = useTransition();
  const dragStartY = useRef(0);
  const dragStartPos = useRef(0);
  const posYRef = useRef(posY);
  const areaRef = useRef<HTMLDivElement>(null);

  // Keep ref in sync with state
  useEffect(() => {
    posYRef.current = posY;
  }, [posY]);

  const save = useCallback(() => {
    const val = posYRef.current;
    setAdjusting(false);
    setDragging(false);
    if (Number.isFinite(val)) {
      startTransition(async () => {
        await onSave(entityId, val);
      });
    }
  }, [entityId, onSave]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adjusting) {
      save();
    } else {
      setAdjusting(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!adjusting) return;
    // Don't intercept the button click
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragStartY.current = e.clientY;
    dragStartPos.current = posYRef.current;
  };

  useEffect(() => {
    if (!dragging) return;

    const containerHeight = areaRef.current?.getBoundingClientRect().height ?? 200;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY.current;
      // Dragging mouse down → shows higher part of image → lower %
      // Dragging mouse up → shows lower part of image → higher %
      const deltaPct = -(deltaY / containerHeight) * 100;
      const newPos = Math.round(Math.min(100, Math.max(0, dragStartPos.current + deltaPct)));
      setPosY(newPos);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Escape → cancel and revert
  useEffect(() => {
    if (!adjusting) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPosY(safeInitial);
        setAdjusting(false);
        setDragging(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjusting, safeInitial]);

  // Click outside → save
  useEffect(() => {
    if (!adjusting) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        save();
      }
    };
    const timer = setTimeout(() => {
      window.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [adjusting, save]);

  return (
    <div
      ref={areaRef}
      className={`absolute inset-0 ${adjusting ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
      onMouseDown={handleMouseDown}
      onClick={adjusting ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition: `center ${posY}%` }}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        title={adjusting ? "Click to save position" : "Adjust image position"}
        className={`absolute bottom-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm transition-opacity ${
          adjusting
            ? "bg-gold/80 text-background opacity-100"
            : "bg-background/70 text-muted-foreground opacity-0 hover:bg-background/90 hover:text-foreground group-hover/image:opacity-100"
        }`}
      >
        <Move className="h-3 w-3" />
      </button>
    </div>
  );
}

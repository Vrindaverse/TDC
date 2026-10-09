"use client";

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export type StoryPageVariant = "cover" | "chapter" | "end";

export interface StoryBookPageContent {
  /** Small overline label, e.g. "chapter 01 — the beginning". */
  kicker?: string;
  /** Page heading. */
  title: string;
  /** Paragraph copy that tells the story. */
  body?: string;
  /** Optional photo slot. */
  image?: string;
  /** Caption shown under the photo. */
  caption?: string;
  /** Layout: cover/end are full-bleed photo pages, chapter is a text page. */
  variant?: StoryPageVariant;
}

export interface StoryBookPage {
  id?: string | number;
  front: StoryBookPageContent;
  back: StoryBookPageContent;
}

export interface StoryBookProps {
  /** Array of leaves, each with a front and back page. */
  pages: StoryBookPage[];
  /** Default turned page count (0 = closed book on cover). */
  defaultTurnedIndex?: number;
  /** Controlled turned page count. */
  turnedIndex?: number;
  /** Callback fired when the turn changes. */
  onPageChange?: (turnedCount: number, totalLeaves: number) => void;
  /** Width of a single page in pixels. */
  pageWidth?: number;
  /** Height of a single page in pixels. */
  pageHeight?: number;
  /** 3D perspective depth in pixels. */
  perspective?: number;
  /** Maximum hover peek angle in degrees. */
  peekAngle?: number;
  /** Total turn angle in degrees (default 180). */
  turnAngle?: number;
  /** Flip transition duration in seconds. */
  duration?: number;
  /** Easing curve for the flip animation. */
  easing?: string;
  /** Shadow intensity factor (0.0–1.0). */
  shadowIntensity?: number;
  /** Center the opened spread horizontally. */
  spineShift?: boolean;
  /** Page border radius. */
  radius?: string | number;
  /** Show page-number tags. */
  showPageNumbers?: boolean;
  /** Show the leather spine binding. */
  showSpineBinding?: boolean;
  /** Accent color for kickers and prompts. */
  accentColor?: string;
  /** Enable automatic flipping. */
  autoplay?: boolean;
  /** Autoplay interval in ms. */
  autoplayInterval?: number;
  /** Pause autoplay on hover. */
  pauseOnHover?: boolean;
  /** Allow clicking pages to flip. */
  interactive?: boolean;
  /** Show the toolbar. */
  showControls?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface StoryBookHandle {
  next: () => void;
  prev: () => void;
  reset: () => void;
  goTo: (index: number) => void;
  getTurnedCount: () => number;
  getTotalLeaves: () => number;
}

interface BookFaceProps {
  content: StoryBookPageContent;
  pageNo: number;
  showPageNumbers: boolean;
  roundedRadius: string;
  accentColor: string;
  shadowIntensity: number;
}

function BookFace({
  content,
  pageNo,
  showPageNumbers,
  roundedRadius,
  accentColor,
  shadowIntensity,
}: BookFaceProps) {
  const isPhoto = content.variant === "cover" || content.variant === "end";

  if (isPhoto) {
    return (
      <div
        className="absolute inset-0 h-full w-full overflow-hidden bg-zinc-950"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: roundedRadius,
          boxShadow: `0 12px 28px rgba(0, 0, 0, ${shadowIntensity})`,
        }}
      >
        <img
          src={content.image}
          alt={content.title}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          loading="lazy"
          decoding="async"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"
        />
        <div className="relative flex h-full flex-col justify-end p-6 text-white">
          {content.kicker ? (
            <p
              className="tdc-mono mb-2 text-[10px] uppercase tracking-[0.25em]"
              style={{ color: accentColor }}
            >
              {content.kicker}
            </p>
          ) : null}
          <h3 className="text-2xl font-bold leading-tight tracking-tight drop-shadow-sm">
            {content.title}
          </h3>
          {content.body ? (
            <p className="mt-2 text-[11px] leading-relaxed text-white/80">
              {content.body}
            </p>
          ) : null}
          {showPageNumbers ? (
            <span className="tdc-mono mt-4 text-[9px] text-white/50">
              {pageNo}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 h-full w-full overflow-hidden bg-card"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        borderRadius: roundedRadius,
        boxShadow: `0 12px 28px rgba(0, 0, 0, ${shadowIntensity})`,
      }}
    >
      <div className="flex h-full flex-col px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <span
            className="tdc-mono truncate text-[9px] uppercase tracking-[0.22em]"
            style={{ color: accentColor }}
          >
            {content.kicker ?? "tdc / journal"}
          </span>
          {showPageNumbers ? (
            <span className="tdc-mono shrink-0 text-[9px] text-muted-foreground">
              {pageNo}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-[15px] font-bold leading-snug tracking-tight text-card-foreground">
          {content.title}
        </h3>

        {content.body ? (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {content.body}
          </p>
        ) : null}

        {content.image ? (
          <figure className="relative mt-auto overflow-hidden rounded-[3px] border border-border/60">
            <img
              src={content.image}
              alt={content.title}
              className="h-28 w-full select-none object-cover"
              loading="lazy"
              decoding="async"
            />
            {content.caption ? (
              <figcaption className="tdc-mono w-full truncate bg-black/60 px-2 py-1 text-[9px] text-white/90">
                {content.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="tdc-mono mt-1 pt-3 text-[9px] text-muted-foreground/70">
          ~/tdc/<span style={{ color: accentColor }}>story</span>
          {" "}
          <span
            aria-hidden="true"
            className="tdc-caret"
            style={{ color: accentColor }}
          />
        </div>
      </div>
    </div>
  );
}

export const StoryBook = forwardRef<StoryBookHandle, StoryBookProps>(
  (
    {
      pages,
      defaultTurnedIndex = 0,
      turnedIndex: controlledTurnedIndex,
      onPageChange,
      pageWidth = 240,
      pageHeight = 340,
      perspective = 1400,
      peekAngle = 14,
      turnAngle = 180,
      duration = 0.7,
      easing = "cubic-bezier(0.4, 0, 0.2, 1)",
      shadowIntensity = 0.45,
      spineShift = true,
      radius = "6px",
      showPageNumbers = true,
      showSpineBinding = true,
      accentColor = "#00F5FF",
      autoplay = false,
      autoplayInterval = 7000,
      pauseOnHover = true,
      interactive = true,
      showControls = true,
      className,
      style,
    },
    ref
  ) => {
    const [internalTurned, setInternalTurned] = useState<number>(defaultTurnedIndex);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [peekingIndex, setPeekingIndex] = useState<number | null>(null);

    const totalLeaves = pages.length;
    const currentTurned =
      controlledTurnedIndex !== undefined ? controlledTurnedIndex : internalTurned;
    const isOpen = currentTurned > 0 && currentTurned < totalLeaves;

    const roundedRadius = typeof radius === "number" ? `${radius}px` : radius;

    const setTurned = useCallback(
      (newCount: number) => {
        const clamped = Math.max(0, Math.min(newCount, totalLeaves));
        if (controlledTurnedIndex === undefined) {
          setInternalTurned(clamped);
        }
        if (onPageChange) {
          onPageChange(clamped, totalLeaves);
        }
      },
      [controlledTurnedIndex, totalLeaves, onPageChange]
    );

    const flipNext = useCallback(() => {
      if (currentTurned < totalLeaves) {
        setTurned(currentTurned + 1);
      }
    }, [currentTurned, totalLeaves, setTurned]);

    const flipPrev = useCallback(() => {
      if (currentTurned > 0) {
        setTurned(currentTurned - 1);
      }
    }, [currentTurned, setTurned]);

    const resetBook = useCallback(() => {
      setTurned(0);
    }, [setTurned]);

    useImperativeHandle(ref, () => ({
      next: flipNext,
      prev: flipPrev,
      reset: resetBook,
      goTo: (idx) => setTurned(idx),
      getTurnedCount: () => currentTurned,
      getTotalLeaves: () => totalLeaves,
    }));

    // Autoplay timer
    useEffect(() => {
      if (!autoplay || (pauseOnHover && isHovered) || totalLeaves <= 1) return;
      const timer = setInterval(() => {
        setInternalTurned((prev) => (prev >= totalLeaves ? 0 : prev + 1));
      }, autoplayInterval);
      return () => clearInterval(timer);
    }, [autoplay, autoplayInterval, pauseOnHover, isHovered, totalLeaves]);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") flipNext();
        if (e.key === "ArrowLeft") flipPrev();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [flipNext, flipPrev]);

    const handleLeafClick = (index: number) => {
      if (!interactive) return;
      if (index === currentTurned) {
        flipNext();
      } else if (index === currentTurned - 1) {
        flipPrev();
      }
    };

    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center select-none py-6",
          className
        )}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setPeekingIndex(null);
        }}
      >
        {/* 3D book viewport stage */}
        <div
          className="relative flex items-center justify-center transition-all duration-500"
          style={{
            perspective: `${perspective}px`,
            width: `${pageWidth * 2 + 40}px`,
            height: `${pageHeight + 40}px`,
          }}
        >
          {/* 3D book container */}
          <div
            className="relative transition-transform"
            style={{
              width: `${pageWidth}px`,
              height: `${pageHeight}px`,
              transformStyle: "preserve-3d",
              transition: `transform ${duration}s ${easing}`,
              transform: spineShift && isOpen ? `translateX(${pageWidth / 2}px)` : "translateX(0)",
            }}
          >
            {/* Spine shadow & binding crease */}
            {showSpineBinding ? (
              <div
                className="pointer-events-none absolute top-0 bottom-0 left-[-4px] z-30 w-[8px] rounded-l-sm bg-gradient-to-r from-black/80 via-zinc-800 to-black/40 shadow-2xl"
                style={{ opacity: isOpen ? 0.95 : 0.6, transition: `opacity ${duration}s ease` }}
              />
            ) : null}

            {/* Ground ambience drop shadow */}
            <div
              className="pointer-events-none absolute -bottom-6 left-[-15%] h-8 w-[130%] rounded-full bg-black/40 blur-xl transition-all duration-500"
              style={{
                opacity: isOpen ? 0.7 : 0.4,
                transform: isOpen ? "scale(1.15)" : "scale(0.85)",
              }}
            />

            {/* Leaf stacking loop */}
            {pages.map((leaf, index) => {
              const isTurned = index < currentTurned;
              const isCanPeek = index === currentTurned;
              const isPeeking = peekingIndex === index;

              const zIndex = isTurned ? index + 1 : totalLeaves - index;

              let leafRotation = isTurned ? -turnAngle : 0;
              if (!isTurned && isPeeking) {
                leafRotation = -peekAngle;
              }

              return (
                <div
                  key={leaf.id ?? index}
                  onClick={() => handleLeafClick(index)}
                  onMouseEnter={() => {
                    if (isCanPeek) setPeekingIndex(index);
                  }}
                  onMouseLeave={() => {
                    if (peekingIndex === index) setPeekingIndex(null);
                  }}
                  className={cn(
                    "absolute inset-0 origin-left",
                    interactive ? "cursor-pointer" : "pointer-events-none"
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                    transition: `transform ${duration}s ${easing}`,
                    transform: `rotateY(${leafRotation}deg)`,
                    zIndex,
                    borderRadius: roundedRadius,
                  }}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      borderRadius: roundedRadius,
                    }}
                  >
                    <BookFace
                      content={leaf.front}
                      pageNo={index * 2 + 1}
                      showPageNumbers={showPageNumbers}
                      roundedRadius={roundedRadius}
                      accentColor={accentColor}
                      shadowIntensity={shadowIntensity}
                    />
                  </div>

                  {/* Back face */}
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderRadius: roundedRadius,
                    }}
                  >
                    <BookFace
                      content={leaf.back}
                      pageNo={index * 2 + 2}
                      showPageNumbers={showPageNumbers}
                      roundedRadius={roundedRadius}
                      accentColor={accentColor}
                      shadowIntensity={shadowIntensity}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {showControls ? (
          <div className="mt-4 flex select-none items-center justify-center gap-2">
            <button
              onClick={flipPrev}
              disabled={currentTurned === 0}
              aria-label="Previous page"
              className="tdc-mono flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
              <span>prev</span>
            </button>

            <button
              onClick={resetBook}
              disabled={currentTurned === 0}
              aria-label="Reset book"
              className="tdc-mono flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              <span>reset</span>
            </button>

            <div className="tdc-mono rounded-[4px] border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{currentTurned}</span>
              <span className="opacity-50"> / </span>
              <span>{totalLeaves} leaves</span>
            </div>

            <button
              onClick={flipNext}
              disabled={currentTurned === totalLeaves}
              aria-label="Next page"
              className="tdc-mono flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <span>next</span>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    );
  }
);

StoryBook.displayName = "StoryBook";

export default StoryBook;
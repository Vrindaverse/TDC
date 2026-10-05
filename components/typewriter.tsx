"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface TerminalLine {
  /** The typed command, rendered without its leading `$`. */
  prompt: string;
  /** What the shell prints back. */
  output: string;
}

interface TypewriterProps {
  lines: readonly TerminalLine[];
  /** Characters revealed per second. */
  speed?: number;
  className?: string;
}

/**
 * Reveals terminal output character by character.
 *
 * The server render and the first client render both output the *finished*
 * text, so hydration can never mismatch. The animation only starts after
 * mount, and is skipped entirely under reduced motion. The reset to zero
 * happens inside the first animation frame rather than synchronously in the
 * effect body, so nothing is painted in the fully-revealed state.
 */
export function Typewriter({
  lines,
  speed = 32,
  className,
}: TypewriterProps) {
  /** Cumulative character offset where each line's output begins. */
  const offsets = useMemo(
    () =>
      lines.reduce<number[]>(
        (acc, line) => [...acc, (acc[acc.length - 1] ?? 0) + line.output.length],
        []
      ),
    [lines]
  );

  const total = offsets[offsets.length - 1] ?? 0;
  const [revealed, setRevealed] = useState(total);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (total === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let start: number | null = null;

    const tick = (time: number) => {
      if (start === null) start = time;
      const count = Math.min(
        total,
        Math.floor(((time - start) / 1000) * speed)
      );
      setRevealed(count);
      if (count < total) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [total, speed]);

  const rows = lines.map((line, index) => {
    const take = Math.min(
      line.output.length,
      Math.max(0, revealed - (offsets[index] ?? 0))
    );
    return { line, visible: line.output.slice(0, take) };
  });

  // The caret trails the line currently being typed, and parks on the last
  // line once everything has been revealed.
  const caretIndex = rows.reduce<number>(
    (index, row, i) =>
      row.visible.length < row.line.output.length ? i : index,
    rows.length - 1
  );

  return (
    <div className={cn("space-y-1", className)}>
      {rows.map((row, index) => (
        <p key={row.line.prompt} className="tdc-mono text-xs sm:text-[13px]">
          <span className="text-muted-foreground">
            <span aria-hidden="true">$ </span>
            {row.line.prompt}
          </span>
          <span className="px-2 text-foreground">{row.visible}</span>
          {index === caretIndex ? (
            <span aria-hidden="true" className="tdc-caret text-foreground" />
          ) : null}
        </p>
      ))}
    </div>
  );
}

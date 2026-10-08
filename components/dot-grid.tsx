"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

import { useCssVarHex } from "@/components/use-css-var";

import "./dot-grid.css";

gsap.registerPlugin(InertiaPlugin);

/**
 * Feature test the plugin's own shape rather than GSAP's plugin registry: the
 * registry is only populated once GSAP has booted, so reading it at module scope
 * can report false during SSR even when the plugin is perfectly usable.
 */
const inertiaAvailable =
  typeof (InertiaPlugin as unknown as { init?: unknown } | undefined)?.init ===
  "function";

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  applied: boolean;
}

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  /** 3- or 6-digit hex. */
  baseColor?: string;
  /** 3- or 6-digit hex. */
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: CSSProperties;
}

function hexToRgb(hex: string) {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) value = value.replace(/./g, (c) => c + c);
  if (!/^[\da-f]{6}$/i.test(value)) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/**
 * `InertiaPlugin` is a GSAP add-on. If it is ever missing the grid still needs
 * to respond to the pointer, so pushes fall back to a plain tween rather than
 * silently doing nothing (and without GSAP's "missing plugin" console noise).
 */
function pushDot(dot: Dot, x: number, y: number, resistance: number, returnDuration: number) {
  dot.applied = true;
  const settle = () => {
    gsap.to(dot, {
      xOffset: 0,
      yOffset: 0,
      duration: returnDuration,
      ease: "elastic.out(1,0.75)",
      onComplete: () => {
        dot.applied = false;
      },
    });
  };

  if (inertiaAvailable) {
    gsap.to(dot, {
      inertia: { xOffset: x, yOffset: y, resistance },
      onComplete: settle,
    });
    return;
  }

  gsap.to(dot, { xOffset: x, yOffset: y, duration: 0.6, ease: "power3.out", onComplete: settle });
}

const throttle = <T extends unknown[]>(
  fn: (...args: T) => void,
  limit: number
) => {
  let last = 0;
  return (...args: T) => {
    const now = performance.now();
    if (now - last < limit) return;
    last = now;
    fn(...args);
  };
};

/**
 * Interactive dot field used as the hero backdrop.
 *
 * Differences from the reference implementation, all deliberate:
 *
 * - Monochrome defaults. The upstream `#5227FF` is a saturated violet that would
 *   break the site's black-and-white palette.
 * - The render loop stops doing canvas work whenever the section is scrolled
 *   out of view or the tab is hidden. The reference redraws ~1000 dots every
 *   frame forever.
 * - `prefers-reduced-motion` keeps the proximity highlight but drops the
 *   inertial push and the click shockwave.
 * - Renders a `div`, not an unnamed `section`. As decoration it should not
 *   introduce a landmark with no accessible name.
 */
export default function DotGrid({
  dotSize = 4,
  gap = 25,
  baseColor: baseColorProp = "#d4d4d4",
  activeColor: activeColorProp = "#0a0a0a",
  proximity = 140,
  speedTrigger = 100,
  shockRadius = 220,
  shockStrength = 4,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.4,
  className = "",
  style,
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });
  /** False while off-screen or in a hidden tab: skips the canvas work. */
  const activeRef = useRef(true);

  /* Theme-aware inks: fall back to the given hex props until the CSS variable
     has been resolved (the canvas cannot parse `var()`, and during SSR there is
     no computed style to read). */
  const heroInk = useCssVarHex("--tdc-hero-ink");
  const heroDot = useCssVarHex("--tdc-hero-dot");
  const baseColor = heroDot ?? baseColorProp;
  const activeColor = heroInk ?? activeColorProp;

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;
    const path = new window.Path2D();
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return path;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Assigning width/height resets the transform, so scale after that.
    const ctx = canvas.getContext("2d");
    ctx?.scale(dpr, dpr);

    const cell = dotSize + gap;
    const cols = Math.max(1, Math.floor((width + gap) / cell));
    const rows = Math.max(1, Math.floor((height + gap) / cell));
    const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2;
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({
          cx: startX + col * cell,
          cy: startY + row * cell,
          xOffset: 0,
          yOffset: 0,
          applied: false,
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    buildGrid();
    const wrap = wrapperRef.current;
    if (!wrap) return;

    const observer = new ResizeObserver(buildGrid);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [buildGrid]);

  /* Pause the expensive part of the loop when nobody can see it. */
  useEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;

    const sync = () => {
      activeRef.current = !document.hidden;
    };
    const onVisibility = () => sync();

    const intersection = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0 }
    );
    intersection.observe(wrap);
    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!circlePath) return;

    const proximitySq = proximity * proximity;
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!activeRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pointer = pointerRef.current;

      for (const dot of dotsRef.current) {
        const dx = dot.cx - pointer.x;
        const dy = dot.cy - pointer.y;
        const distSq = dx * dx + dy * dy;

        let fill = baseColor;
        if (distSq <= proximitySq) {
          const t = 1 - Math.sqrt(distSq) / proximity;
          fill = `rgb(${Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t)},${
            Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t)
          },${Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t)})`;
        }

        ctx.save();
        ctx.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset);
        ctx.fillStyle = fill;
        ctx.fill(circlePath);
        ctx.restore();
      }
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [activeColor, activeRgb, baseColor, baseRgb, circlePath, proximity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let reduced = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const readMotion = () => {
      reduced = motionQuery.matches;
    };
    readMotion();
    motionQuery.addEventListener("change", readMotion);

    const onMove = (event: PointerEvent) => {
      const pointer = pointerRef.current;
      const now = performance.now();
      const dt = pointer.lastTime ? now - pointer.lastTime : 16;
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;

      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }

      pointer.lastTime = now;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.vx = vx;
      pointer.vy = vy;
      pointer.speed = speed;

      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;

      if (reduced) return;

      for (const dot of dotsRef.current) {
        if (dot.applied) continue;
        if (speed <= speedTrigger) continue;
        if (Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y) >= proximity) continue;
        pushDot(
          dot,
          dot.cx - pointer.x + vx * 0.005,
          dot.cy - pointer.y + vy * 0.005,
          resistance,
          returnDuration
        );
      }
    };

    const onClick = (event: MouseEvent) => {
      if (reduced) return;
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;

      for (const dot of dotsRef.current) {
        if (dot.applied) continue;
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist >= shockRadius) continue;
        const falloff = 1 - dist / shockRadius;
        pushDot(
          dot,
          (dot.cx - cx) * shockStrength * falloff,
          (dot.cy - cy) * shockStrength * falloff,
          resistance,
          returnDuration
        );
      }
    };

    const throttledMove = throttle(onMove, 50);
    window.addEventListener("pointermove", throttledMove, { passive: true });
    window.addEventListener("click", onClick);

    return () => {
      motionQuery.removeEventListener("change", readMotion);
      window.removeEventListener("pointermove", throttledMove);
      window.removeEventListener("click", onClick);
    };
  }, [maxSpeed, proximity, resistance, returnDuration, shockRadius, shockStrength, speedTrigger]);

  return (
    <div className={`dot-grid ${className}`} style={style} aria-hidden="true">
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </div>
  );
}

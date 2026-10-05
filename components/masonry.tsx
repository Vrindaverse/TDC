"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import "./masonry.css";

export interface MasonryItem {
  id: string;
  img: string;
  /** Internal path. Rendered with `next/link`, so it stays a real link. */
  url: string;
  /** Posters are rendered at half this value, matching the reference API. */
  height: number;
  /** Accessible name for the link, e.g. `"TDC Season 3 — 17 Oct 2026"`. */
  label?: string;
}

export type MasonryDirection = "top" | "bottom" | "left" | "right" | "center" | "random";

interface MasonryProps {
  items: readonly MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: MasonryDirection;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  /** Kept for API parity; the overlay is monochrome to match the site theme. */
  colorShiftOnHover?: boolean;
}

/* Module scope so the media-query listeners are registered exactly once.
   The reference implementation inlines this array, which makes its identity
   change every render and re-runs the effect (and re-registers listeners)
   on every single render. */
const COLUMN_QUERIES = [
  "(min-width:1500px)",
  "(min-width:1000px)",
  "(min-width:600px)",
  "(min-width:400px)",
];
const COLUMN_VALUES = [5, 4, 3, 2];
const DEFAULT_COLUMNS = 1;

function useColumnCount() {
  const read = useCallback(() => {
    if (typeof window === "undefined") return DEFAULT_COLUMNS;
    const index = COLUMN_QUERIES.findIndex((query) =>
      window.matchMedia(query).matches
    );
    return index === -1 ? DEFAULT_COLUMNS : (COLUMN_VALUES[index] ?? DEFAULT_COLUMNS);
  }, []);

  const [columns, setColumns] = useState(read);

  useEffect(() => {
    const handler = () => setColumns(read());
    const lists = COLUMN_QUERIES.map((query) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", handler);
    handler();
    return () => {
      for (const list of lists) list.removeEventListener("change", handler);
    };
  }, [read]);

  return columns;
}

function useMeasure() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

function preloadImages(urls: readonly string[]) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.src = src;
          image.onload = () => resolve();
          image.onerror = () => resolve();
        })
    )
  );
}

interface Placed extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Image masonry that animates itself into place with GSAP.
 *
 * Differences from the reference implementation, all deliberate:
 *
 * - The wrapper's height is set from the tallest column. The reference CSS uses
 *   `height: 100%` on an absolutely-positioned parent, which has no intrinsic
 *   height, so the whole grid collapses to 0px and overlaps the page below.
 * - Items stay hidden until the first layout pass (`data-ready`) so keyboard
 *   users can never focus an invisible link.
 * - `prefers-reduced-motion` places everything immediately instead of animating.
 * - Links are `next/link`, not `window.open(..., "_blank")`.
 */
export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
}: MasonryProps) {
  const columns = useColumnCount();
  const [containerRef, { width }] = useMeasure();
  /** Key of the url set whose images have finished preloading. */
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const hasMounted = useRef(false);

  const urls = useMemo(() => items.map((item) => item.img), [items]);
  const urlKey = useMemo(() => urls.join("|"), [urls]);

  /* Derived rather than reset in an effect body: when `items` changes the key
     stops matching and the grid re-animates, with no cascading render. */
  const imagesReady = readyKey === urlKey;

  useEffect(() => {
    let active = true;
    preloadImages(urls).then(() => {
      if (active) setReadyKey(urlKey);
    });
    return () => {
      active = false;
    };
  }, [urlKey, urls]);

  const { placed, height } = useMemo(() => {
    if (!width) return { placed: [] as Placed[], height: 0 };

    const columnHeights = new Array<number>(columns).fill(0);
    const columnWidth = width / columns;

    const next = items.map((item) => {
      const shortest = Math.min(...columnHeights);
      const column = columnHeights.indexOf(shortest);
      const cardHeight = item.height / 2;

      const entry: Placed = {
        ...item,
        x: columnWidth * column,
        y: columnHeights[column],
        w: columnWidth,
        h: cardHeight,
      };
      columnHeights[column] += cardHeight;
      return entry;
    });

    return { placed: next, height: Math.max(...columnHeights, 0) };
  }, [columns, items, width]);

  const getInitialPosition = useCallback(
    (item: Placed, index: number) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return { x: item.x, y: item.y };

      let direction = animateFrom;
      if (direction === "random") {
        const options: MasonryDirection[] = ["top", "bottom", "left", "right"];
        direction = options[(index * 3 + 1) % options.length];
      }

      switch (direction) {
        case "top":
          return { x: item.x, y: -200 };
        case "bottom":
          return { x: item.x, y: window.innerHeight + 200 };
        case "left":
          return { x: -200, y: item.y };
        case "right":
          return { x: window.innerWidth + 200, y: item.y };
        case "center":
          return {
            x: containerRect.width / 2 - item.w / 2,
            y: containerRect.height / 2 - item.h / 2,
          };
        default:
          return { x: item.x, y: item.y + 100 };
      }
    },
    [animateFrom, containerRef]
  );

  useLayoutEffect(() => {
    if (!imagesReady || placed.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const first = !hasMounted.current;

    for (const [index, item] of placed.entries()) {
      const selector = `[data-masonry-key="${item.id}"]`;
      const settled = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      };

      if (reduced) {
        gsap.set(selector, { ...settled, opacity: 1 });
        continue;
      }

      if (first) {
        const start = getInitialPosition(item, index);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus ? { filter: "blur(10px)" } : {}),
          },
          {
            opacity: 1,
            ...settled,
            ...(blurToFocus ? { filter: "blur(0px)" } : {}),
            duration: 0.8,
            ease: "power3.out",
            delay: index * stagger,
          }
        );
      } else {
        gsap.to(selector, { ...settled, duration, ease, overwrite: "auto" });
      }
    }

    hasMounted.current = true;
    containerRef.current?.setAttribute("data-ready", "true");
  }, [
    blurToFocus,
    containerRef,
    duration,
    ease,
    getInitialPosition,
    imagesReady,
    placed,
    stagger,
  ]);

  const handleMouseEnter = (id: string) => {
    if (!scaleOnHover) return;
    gsap.to(`[data-masonry-key="${id}"]`, {
      scale: hoverScale,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (id: string) => {
    if (!scaleOnHover) return;
    gsap.to(`[data-masonry-key="${id}"]`, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div ref={containerRef} className="list" style={{ height }}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          data-masonry-key={item.id}
          className="item-wrapper"
          aria-label={item.label ?? item.id}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
          onFocus={() => handleMouseEnter(item.id)}
          onBlur={() => handleMouseLeave(item.id)}
        >
          <div
            className="item-img"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            {colorShiftOnHover ? (
              <span aria-hidden="true" className="color-overlay" />
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

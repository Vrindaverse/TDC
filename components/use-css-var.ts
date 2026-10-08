"use client";

import { useEffect, useState } from "react";

function readCssVar(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || null;
}

/**
 * Hex value of a CSS custom property defined on `:root` with a `.dark`
 * override. The canvas 2D API needs a concrete colour (it cannot resolve
 * `var()`/oklch()), so this re-reads the variable whenever the theme swaps and
 * returns an already-resolved hex value for filling/stroking.
 */
export function useCssVarHex(name: string): string | null {
  const [value, setValue] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readCssVar(name)
  );

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setValue(readCssVar(name));
    };
    read();
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.type === "attributes")) {
        if (!raf) raf = requestAnimationFrame(read);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [name]);

  return value;
}
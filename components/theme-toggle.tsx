"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-hidden>
        <Sun aria-hidden="true" className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className="relative"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "size-4 transition-all duration-300",
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute inset-0 m-auto size-4 transition-all duration-300",
          isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        )}
      />
    </Button>
  );
}
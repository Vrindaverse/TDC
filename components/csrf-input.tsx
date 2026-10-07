"use client";

import { useCsrfToken } from "@/hooks/use-csrf";

export function CsrfInput() {
  const token = useCsrfToken();
  return <input type="hidden" name="_csrf" value={token} />;
}

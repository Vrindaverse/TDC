"use client";

import { useEffect, useState } from "react";

let tokenRequest: Promise<string | null> | null = null;

export function useCsrfToken() {
  const [token, setToken] = useState("");

  useEffect(() => {
    tokenRequest ??= fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => String(data.token ?? ""))
      .catch(() => null);

    tokenRequest.then((value) => {
      if (value !== null) {
        setToken(value);
      }
    });
  }, []);

  return token;
}
"use client";

import { useEffect, useState } from "react";

export function useCsrfToken() {
  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch(() => {});
  }, []);

  return token;
}
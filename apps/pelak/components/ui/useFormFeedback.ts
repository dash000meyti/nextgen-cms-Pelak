"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const HIGHLIGHT_MS = 2800;

function focusFirstControl(el: HTMLElement) {
  const control = el.querySelector<HTMLElement>(
    "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable=true], button:not([disabled])",
  );
  if (control && typeof control.focus === "function") {
    try {
      control.focus({ preventScroll: true });
    } catch {
      control.focus();
    }
  }
}

function scrollAndHighlightField(field: string) {
  const selector = `[data-field="${CSS.escape(field)}"]`;
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.setAttribute("data-invalid", "");
  focusFirstControl(target);

  window.setTimeout(() => {
    target.removeAttribute("data-invalid");
  }, HIGHLIGHT_MS);
}

export type FormFeedback = {
  error: string | null;
  success: string | null;
  info: string | null;
  field: string | null;
  reportError: (message: string, field?: string | null) => void;
  reportSuccess: (message: string) => void;
  reportInfo: (message: string) => void;
  clear: () => void;
};

export function useFormFeedback(): FormFeedback {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);
  const pendingFieldRef = useRef<string | null>(null);
  const generationRef = useRef(0);

  const clear = useCallback(() => {
    generationRef.current += 1;
    pendingFieldRef.current = null;
    setError(null);
    setSuccess(null);
    setInfo(null);
    setField(null);
  }, []);

  const reportError = useCallback(
    (message: string, nextField?: string | null) => {
      generationRef.current += 1;
      pendingFieldRef.current = nextField ?? null;
      setSuccess(null);
      setInfo(null);
      setError(message);
      setField(nextField ?? null);
    },
    [],
  );

  const reportSuccess = useCallback((message: string) => {
    generationRef.current += 1;
    pendingFieldRef.current = null;
    setError(null);
    setInfo(null);
    setField(null);
    setSuccess(message);
  }, []);

  const reportInfo = useCallback((message: string) => {
    generationRef.current += 1;
    pendingFieldRef.current = null;
    setError(null);
    setSuccess(null);
    setField(null);
    setInfo(message);
  }, []);

  useEffect(() => {
    if (!error) return;

    const gen = generationRef.current;
    const nextField = pendingFieldRef.current;
    pendingFieldRef.current = null;

    const frame = requestAnimationFrame(() => {
      if (gen !== generationRef.current) return;
      if (nextField) {
        scrollAndHighlightField(nextField);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [error]);

  return {
    error,
    success,
    info,
    field,
    reportError,
    reportSuccess,
    reportInfo,
    clear,
  };
}

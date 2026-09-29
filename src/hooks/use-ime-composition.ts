"use client";

import { useCallback, useRef } from "react";

import {
  isImeComposingKeyEvent,
  type ImeKeyEventLike,
} from "@/lib/ime";

/**
 * Tracks IME composition so Enter that confirms a conversion is not treated as
 * “submit / search”. Safari fires that Enter *after* `compositionend` with
 * `isComposing === false`, so we keep a one-tick `justEnded` flag.
 */
export function useImeComposition() {
  const composingRef = useRef(false);
  const justEndedRef = useRef(false);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCompositionStart = useCallback(() => {
    composingRef.current = true;
    justEndedRef.current = false;
    if (endTimerRef.current != null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
  }, []);

  const onCompositionEnd = useCallback(() => {
    composingRef.current = false;
    justEndedRef.current = true;
    if (endTimerRef.current != null) {
      clearTimeout(endTimerRef.current);
    }
    endTimerRef.current = setTimeout(() => {
      justEndedRef.current = false;
      endTimerRef.current = null;
    }, 0);
  }, []);

  const isComposing = useCallback((event?: ImeKeyEventLike) => {
    if (composingRef.current || justEndedRef.current) return true;
    if (event && isImeComposingKeyEvent(event)) return true;
    return false;
  }, []);

  return {
    onCompositionStart,
    onCompositionEnd,
    isComposing,
  };
}

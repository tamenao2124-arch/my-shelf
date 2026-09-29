"use client";

import {
  type ChangeEvent,
  type ComponentProps,
  type CompositionEvent,
  type KeyboardEvent,
} from "react";

import { Input } from "@/components/ui/input";
import { useImeComposition } from "@/hooks/use-ime-composition";
import { isImeComposingKeyEvent } from "@/lib/ime";

type ImeTextInputProps = ComponentProps<typeof Input> & {
  /** Called on Enter only after IME conversion has finished. */
  onConfirmEnter?: () => void;
};

/**
 * Controlled text field that keeps IME composing text in state and does not
 * treat conversion-confirm Enter as a submit/search shortcut.
 */
export function ImeTextInput({
  onChange,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onConfirmEnter,
  ...props
}: ImeTextInputProps) {
  const ime = useImeComposition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
  }

  function handleCompositionStart(event: CompositionEvent<HTMLInputElement>) {
    ime.onCompositionStart();
    onCompositionStart?.(event);
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    ime.onCompositionEnd();
    onCompositionEnd?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Let the IME consume Enter while converting (hiragana/katakana/kanji).
      if (isImeComposingKeyEvent(event)) {
        onKeyDown?.(event);
        return;
      }
      // Safari: the confirming Enter arrives after compositionend.
      if (ime.isComposing(event)) {
        event.preventDefault();
        onKeyDown?.(event);
        return;
      }
      if (onConfirmEnter) {
        event.preventDefault();
        onKeyDown?.(event);
        onConfirmEnter();
        return;
      }
    }
    onKeyDown?.(event);
  }

  return (
    <Input
      {...props}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
    />
  );
}

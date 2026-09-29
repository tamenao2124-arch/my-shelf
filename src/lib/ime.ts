import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type ImeKeyEventLike = Pick<
  ReactKeyboardEvent<HTMLElement>,
  "nativeEvent" | "keyCode" | "which" | "key"
>;

/**
 * True while an IME (e.g. Japanese kana→kanji conversion) is handling the key.
 * `keyCode` / `which` 229 is the legacy “IME processing” sentinel still set by
 * some browsers during composition.
 */
export function isImeComposingKeyEvent(event: ImeKeyEventLike): boolean {
  if (event.nativeEvent?.isComposing) return true;
  if (event.key === "Process") return true;
  if (event.keyCode === 229 || event.which === 229) return true;
  return false;
}

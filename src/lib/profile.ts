export const HANDLE_PATTERN = /^[a-z0-9][a-z0-9._]{1,23}$/;

const ACCENTS = [
  "oklch(0.28 0.03 95)",
  "oklch(0.32 0.04 250)",
  "oklch(0.42 0.07 130)",
  "oklch(0.48 0.1 85)",
  "oklch(0.22 0.01 90)",
  "oklch(0.55 0.12 95)",
  "oklch(0.36 0.08 80)",
  "oklch(0.3 0.02 200)",
];

export function accentFor(seed: string) {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

export function normalizeHandle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function validateHandle(handle: string) {
  if (!HANDLE_PATTERN.test(handle)) {
    return "ハンドルは半角英数字と . _ で2〜24文字にしてください。";
  }
  return "";
}

export function validateName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 24) {
    return "表示名は1〜24文字で入力してください。";
  }
  return "";
}

export function validateBio(bio: string) {
  if (bio.length > 160) {
    return "自己紹介は160文字以内にしてください。";
  }
  return "";
}

export function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "メールアドレスの形式が正しくありません。";
  }
  return "";
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return "パスワードは8文字以上にしてください。";
  }
  return "";
}

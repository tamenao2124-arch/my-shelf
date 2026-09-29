"use client";

import { useState, type FormEvent } from "react";

import { ImeTextInput } from "@/components/ime-text-input";
import { UserAvatar } from "@/components/user-avatar";
import { useSocial } from "@/components/social-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { normalizeHandle, validateBio, validateHandle, validateName } from "@/lib/profile";
import type { UserProfile } from "@/lib/social";

export function ProfileEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentUser } = useSocial();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && currentUser ? (
        <ProfileEditorBody user={currentUser} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

function ProfileEditorBody({
  user,
  onOpenChange,
}: {
  user: UserProfile;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateProfile, uploadAvatar } = useSocial();
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onPickAvatar(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選んでください。");
      return;
    }
    setError("");
    setPending(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "画像の読み込みに失敗しました。");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nameError = validateName(name);
    const handleError = validateHandle(normalizeHandle(handle));
    const bioError = validateBio(bio);
    if (nameError || handleError || bioError) {
      setError(nameError || handleError || bioError);
      return;
    }
    setPending(true);
    setError("");
    try {
      await updateProfile({
        name,
        handle: normalizeHandle(handle),
        bio,
        avatarUrl,
      });
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存に失敗しました。");
    } finally {
      setPending(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">プロフィールを編集</DialogTitle>
        <DialogDescription>
          アイコン・表示名・ハンドル・自己紹介を、自分の棚に反映します。
        </DialogDescription>
      </DialogHeader>
      <form id="profile-edit" onSubmit={onSubmit} className="grid gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={name || user.name}
            accent={user.accent}
            avatarUrl={avatarUrl}
            size="lg"
          />
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium">アイコン</span>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:font-semibold file:text-foreground"
              onChange={(event) => {
                void onPickAvatar(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">表示名</span>
          <ImeTextInput
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            autoComplete="nickname"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">ハンドル</span>
          <ImeTextInput
            value={handle}
            onChange={(event) => setHandle(event.currentTarget.value)}
            autoComplete="username"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">自己紹介</span>
          <Textarea
            value={bio}
            onChange={(event) => setBio(event.currentTarget.value)}
            rows={3}
            maxLength={160}
            placeholder="いま熱中している作品や、棚のテーマをひとこと。"
          />
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          キャンセル
        </Button>
        <Button type="submit" form="profile-edit" disabled={pending}>
          {pending ? "保存しています…" : "保存する"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

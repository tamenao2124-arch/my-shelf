"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send } from "lucide-react";

import { ImeTextInput } from "@/components/ime-text-input";
import { SpoilerText } from "@/components/spoiler-text";
import { SparkleBurst } from "@/components/sparkle-burst";
import { TagPills } from "@/components/tag-pills";
import { UserAvatar } from "@/components/user-avatar";
import { useAuthDialog } from "@/components/auth-dialog";
import { useSocial } from "@/components/social-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { formatRelativeTime, type FeedPost } from "@/lib/social";
import { MEDIA_EMOJI, MEDIA_LABEL, mediaCreator } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FeedCard({ post }: { post: FeedPost }) {
  const {
    userById,
    likes,
    comments,
    toggleLike,
    likedByMe,
    addComment,
    isAuthenticated,
  } = useSocial();
  const { openAuthDialog } = useAuthDialog();
  const author = userById(post.userId);
  const [draft, setDraft] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [burst, setBurst] = useState(false);
  const likeCount = (likes[post.id] ?? []).length;
  const thread = comments[post.id] ?? [];
  const liked = likedByMe(post.id);

  if (!author) return null;

  function submitComment() {
    addComment(post.id, draft);
    setDraft("");
    setShowComments(true);
  }

  function handleComment(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <article className="rounded-lg border border-foreground/10 bg-white p-4 poster-card sm:p-5">
      <header className="flex items-center gap-3">
        <Link href={`/users/${author.id}`} className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={author.name}
            accent={author.accent}
            avatarUrl={author.avatarUrl}
          />
          <span className="min-w-0">
            <span className="block truncate font-medium">{author.name}</span>
            <span className="block text-xs text-muted-foreground">
              @{author.handle} · {formatRelativeTime(post.createdAt)}
            </span>
          </span>
        </Link>
      </header>
      <p className="mt-3 text-sm text-muted-foreground">
        棚に{MEDIA_LABEL[post.item.type]}を追加しました
      </p>
      <div className="mt-3 flex gap-3 rounded-lg bg-muted/70 p-3">
        <Link href={`/users/${author.id}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-[#111111] sm:size-28">
          {post.item.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.item.coverUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl">
              {MEDIA_EMOJI[post.item.type]}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Badge variant="outline" className="mb-1.5">
            {MEDIA_EMOJI[post.item.type]} {MEDIA_LABEL[post.item.type]}
          </Badge>
          <h2 className="font-heading text-lg leading-snug">{post.item.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {mediaCreator(post.item)}
            {post.item.year ? ` · ${post.item.year}` : ""}
          </p>
          <StarRating value={post.item.rating} showValue />
          <div className="mt-2">
            <TagPills tags={post.item.tags} limit={1} />
          </div>
          <div className="mt-2">
            <SpoilerText
              text={post.item.comment}
              spoiler={post.item.spoiler}
              className="line-clamp-4 text-sm leading-relaxed text-foreground/80"
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            if (!isAuthenticated) {
              openAuthDialog("login");
              return;
            }
            if (!liked) {
              setBurst(true);
              window.setTimeout(() => setBurst(false), 700);
            }
            void toggleLike(post.id);
          }}
          aria-pressed={liked}
          className={cn("relative gap-1.5", liked && "text-foreground")}
        >
          <SparkleBurst active={burst} />
          <Heart className={cn("size-4 transition-transform", liked && "fill-primary scale-110")} />
          {likeCount}
        </Button>
        <Button
          variant="ghost"
          className="gap-1.5"
          onClick={() => setShowComments((value) => !value)}
        >
          <MessageCircle className="size-4" />
          {thread.length}
        </Button>
      </div>
      {showComments || thread.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {thread.map((comment) => {
            const commenter = userById(comment.userId);
            if (!commenter) return null;
            return (
              <li key={comment.id} className="flex gap-2 text-sm">
                <UserAvatar
                  name={commenter.name}
                  accent={commenter.accent}
                  avatarUrl={commenter.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2">
                  <Link href={`/users/${commenter.id}`} className="font-medium">
                    {commenter.name}
                  </Link>
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                  <p className="mt-0.5 leading-relaxed">{comment.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {isAuthenticated ? (
        <form onSubmit={handleComment} className="mt-3 flex gap-2">
          <ImeTextInput
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onConfirmEnter={submitComment}
            placeholder="コメントを書く"
            className="h-9"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <Button
            type="button"
            size="icon"
            aria-label="コメントを送る"
            onClick={submitComment}
          >
            <Send className="size-4" />
          </Button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          <button
            type="button"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
            onClick={() => openAuthDialog("login")}
          >
            ログイン
          </button>
          すると、いいねとコメントができます。
        </p>
      )}
    </article>
  );
}

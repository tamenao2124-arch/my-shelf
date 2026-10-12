"use client";

import { useAuthDialog } from "@/components/auth-dialog";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/components/social-provider";

export function FollowButton({
  userId,
  compact = false,
}: {
  userId: string;
  compact?: boolean;
}) {
  const { currentUserId, isAuthenticated, isFollowing, toggleFollow } =
    useSocial();
  const { openAuthDialog } = useAuthDialog();
  const size = compact ? "sm" : "default";

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size={size} onClick={() => openAuthDialog("login")}>
        {compact ? "フォロー" : "ログインしてフォロー"}
      </Button>
    );
  }

  if (userId === currentUserId) {
    return (
      <Button variant="outline" size={size} disabled>
        あなた
      </Button>
    );
  }

  const following = isFollowing(userId);

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size}
      onClick={() => {
        void toggleFollow(userId);
      }}
    >
      {following ? "フォロー中" : "フォロー"}
    </Button>
  );
}

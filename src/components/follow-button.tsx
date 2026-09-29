"use client";

import { useAuthDialog } from "@/components/auth-dialog";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/components/social-provider";

export function FollowButton({ userId }: { userId: string }) {
  const { currentUserId, isAuthenticated, isFollowing, toggleFollow } =
    useSocial();
  const { openAuthDialog } = useAuthDialog();

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => openAuthDialog("login")}>
        ログインしてフォロー
      </Button>
    );
  }

  if (userId === currentUserId) {
    return (
      <Button variant="outline" disabled>
        あなた
      </Button>
    );
  }

  const following = isFollowing(userId);

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={() => {
        void toggleFollow(userId);
      }}
    >
      {following ? "フォロー中" : "フォロー"}
    </Button>
  );
}

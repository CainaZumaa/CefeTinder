export type MatchEvent =
  | {
      type: "MATCH_LIKE_SENT";
      payload: { fromUserId: string; toUserId: string; isSuperLike: boolean };
    }
  | {
      type: "MATCH_SUPER_LIKE_SENT";
      payload: { fromUserId: string; toUserId: string; isSuperLike: boolean };
    }
  | {
      type: "MATCH_CREATED";
      payload: {
        matchId: string;
        user1Id: string;
        user2Id: string;
        matchedAt: string | null;
        isSuperLike: boolean;
      };
    }
  | {
      type: "MATCH_DISLIKE_SENT";
      payload: { fromUserId: string; toUserId: string };
    };

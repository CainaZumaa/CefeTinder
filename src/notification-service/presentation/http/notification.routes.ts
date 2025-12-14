import { Router } from "express";
import { NotifyLikeUseCase } from "../../application/use-cases/NotifyLikeUseCase";
import { NotifyMatchUseCase } from "../../application/use-cases/NotifyMatchUseCase";

type AnyRecord = Record<string, any>;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function createNotificationRouter(params: {
  notifyLike: NotifyLikeUseCase;
  notifyMatch: NotifyMatchUseCase;
}): Router {
  const router = Router();

  router.post("/notify/like", (req, res) => {
    const body: AnyRecord = req.body ?? {};

    // Backward compatible: accept either { match: { user1_id, user2_id, is_super_like } }
    // or { userId, targetUserId, isSuperLike }
    const match = body.match as AnyRecord | undefined;

    const fromUserId =
      asString(body.userId) ??
      asString(match?.user1_id) ??
      asString(match?.user1Id);

    const toUserId =
      asString(body.targetUserId) ??
      asString(match?.user2_id) ??
      asString(match?.user2Id);

    const isSuperLike =
      typeof body.isSuperLike === "boolean"
        ? body.isSuperLike
        : typeof match?.is_super_like === "boolean"
        ? match.is_super_like
        : typeof match?.isSuperLike === "boolean"
        ? match.isSuperLike
        : false;

    if (!fromUserId || !toUserId) {
      return res.status(400).send("Missing like notification data");
    }

    try {
      params.notifyLike.execute({
        fromUserId,
        toUserId,
        isSuperLike,
      });
      return res.status(200).send("Like notification sent");
    } catch (error) {
      console.error("Failed to send like notification:", error);
      return res.status(500).send("Failed to send like notification");
    }
  });

  router.post("/notify/match", (req, res) => {
    const body: AnyRecord = req.body ?? {};
    const match = body.match as AnyRecord | undefined;

    if (!match) {
      return res.status(400).send("Missing match data");
    }

    const matchId = asString(match.id) ?? asString(match.matchId);
    const user1Id = asString(match.user1_id) ?? asString(match.user1Id);
    const user2Id = asString(match.user2_id) ?? asString(match.user2Id);

    if (!matchId || !user1Id || !user2Id) {
      return res.status(400).send("Invalid match data");
    }

    const matchedAt = match.matched_at ?? match.matchedAt;
    const isSuperLike =
      typeof match.is_super_like === "boolean"
        ? match.is_super_like
        : typeof match.isSuperLike === "boolean"
        ? match.isSuperLike
        : false;

    try {
      params.notifyMatch.execute({
        matchId,
        user1Id,
        user2Id,
        matchedAt,
        isSuperLike,
      });
      return res.status(200).send("Match notification sent");
    } catch (error) {
      console.error("Failed to send match notification:", error);
      return res.status(500).send("Failed to send match notification");
    }
  });

  return router;
}

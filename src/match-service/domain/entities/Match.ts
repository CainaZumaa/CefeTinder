import { MatchEvent } from "../events/MatchEvent";
import { UserId } from "../value-objects/UserId";

type MatchProps = {
  id?: string;
  user1Id: UserId;
  user2Id: UserId;
  user1Liked: boolean;
  user2Liked: boolean;
  isSuperLike: boolean;
  matchedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type LikeOutcome = {
  event: "MATCH_CREATED" | "MATCH_SUPER_LIKE_SENT" | "MATCH_LIKE_SENT";
  targetUserId: UserId;
  actor: UserId;
  isSuperLike: boolean;
};

type DislikeOutcome = {
  event: "MATCH_DISLIKE_SENT";
  targetUserId: UserId;
  actor: UserId;
};

export class Match {
  private constructor(private props: MatchProps) {}

  static createNewLike(params: {
    userId: UserId;
    targetUserId: UserId;
    isSuperLike: boolean;
  }): Match {
    return new Match({
      user1Id: params.userId,
      user2Id: params.targetUserId,
      user1Liked: true,
      user2Liked: false,
      isSuperLike: params.isSuperLike,
      matchedAt: null,
    });
  }

  static createNewDislike(params: {
    userId: UserId;
    targetUserId: UserId;
  }): Match {
    return new Match({
      user1Id: params.userId,
      user2Id: params.targetUserId,
      user1Liked: false,
      user2Liked: false,
      isSuperLike: false,
      matchedAt: null,
    });
  }

  static create(props: MatchProps): Match {
    return new Match(props);
  }

  like(actor: UserId, isSuperLike: boolean): LikeOutcome {
    this.assertParticipant(actor);
    if (this.props.user1Id.equals(actor)) {
      this.props.user1Liked = true;
    } else {
      this.props.user2Liked = true;
    }
    if (isSuperLike) {
      this.props.isSuperLike = true;
    }
    const targetUserId = this.props.user1Id.equals(actor)
      ? this.props.user2Id
      : this.props.user1Id;
    if (this.props.user1Liked && this.props.user2Liked) {
      if (!this.props.matchedAt) {
        this.props.matchedAt = new Date();
      }
      return {
        event: "MATCH_CREATED",
        targetUserId,
        actor,
        isSuperLike: this.props.isSuperLike,
      };
    }
    if (isSuperLike) {
      return {
        event: "MATCH_SUPER_LIKE_SENT",
        targetUserId,
        actor,
        isSuperLike,
      };
    }
    return { event: "MATCH_LIKE_SENT", targetUserId, actor, isSuperLike };
  }

  dislike(actor: UserId): DislikeOutcome {
    this.assertParticipant(actor);
    if (this.props.user1Id.equals(actor)) {
      this.props.user1Liked = false;
    } else {
      this.props.user2Liked = false;
    }
    const targetUserId = this.props.user1Id.equals(actor)
      ? this.props.user2Id
      : this.props.user1Id;
    return { event: "MATCH_DISLIKE_SENT", targetUserId, actor };
  }

  toEvent(event: LikeOutcome | DislikeOutcome): MatchEvent {
    if (event.event === "MATCH_CREATED") {
      return {
        type: "MATCH_CREATED",
        payload: {
          matchId: this.props.id ?? "",
          user1Id: this.props.user1Id.toString(),
          user2Id: this.props.user2Id.toString(),
          matchedAt: this.props.matchedAt
            ? this.props.matchedAt.toISOString()
            : null,
          isSuperLike: this.props.isSuperLike,
        },
      };
    }
    if (event.event === "MATCH_DISLIKE_SENT") {
      return {
        type: "MATCH_DISLIKE_SENT",
        payload: {
          fromUserId: event.actor.toString(),
          toUserId: event.targetUserId.toString(),
        },
      };
    }
    if (event.event === "MATCH_SUPER_LIKE_SENT") {
      return {
        type: "MATCH_SUPER_LIKE_SENT",
        payload: {
          fromUserId: event.actor.toString(),
          toUserId: event.targetUserId.toString(),
          isSuperLike: event.isSuperLike,
        },
      };
    }
    return {
      type: "MATCH_LIKE_SENT",
      payload: {
        fromUserId: event.actor.toString(),
        toUserId: event.targetUserId.toString(),
        isSuperLike: event.isSuperLike,
      },
    };
  }

  get id(): string | undefined {
    return this.props.id;
  }

  set id(value: string | undefined) {
    this.props.id = value;
  }

  get user1Id(): UserId {
    return this.props.user1Id;
  }

  get user2Id(): UserId {
    return this.props.user2Id;
  }

  get user1Liked(): boolean {
    return this.props.user1Liked;
  }

  get user2Liked(): boolean {
    return this.props.user2Liked;
  }

  get isSuperLike(): boolean {
    return this.props.isSuperLike;
  }

  get matchedAt(): Date | null | undefined {
    return this.props.matchedAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  private assertParticipant(userId: UserId): void {
    const isParticipant =
      this.props.user1Id.equals(userId) || this.props.user2Id.equals(userId);
    if (!isParticipant) {
      throw new Error("User not part of this match");
    }
  }
}

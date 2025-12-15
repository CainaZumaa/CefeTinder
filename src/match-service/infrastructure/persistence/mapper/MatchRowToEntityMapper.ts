import { Match } from "src/match-service/domain/entities/Match";
import { MatchRow } from "../PostgresMatchRepository";
import { UserId } from "src/match-service/domain/value-objects/UserId";

export class MatchRowToEntityMapper {
    static map(row: MatchRow): Match {
        return Match.create({
            id: row.id,
            user1Id: UserId.create(row.user1_id),
            user2Id: UserId.create(row.user2_id),
            user1Liked: row.user1_liked,
            user2Liked: row.user2_liked,
            isSuperLike: row.is_super_like,
            matchedAt: row.matched_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    } 
}
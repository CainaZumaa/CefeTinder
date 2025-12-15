import { QueryResultRow } from "pg";
import { pool } from "../../../config/database";
import { MatchRepository } from "../../application/ports/MatchRepository";
import { Match } from "../../domain/entities/Match";
import { UserId } from "../../domain/value-objects/UserId";
import { MatchRowToEntityMapper } from "./mapper/MatchRowToEntityMapper";

export type MatchRow = QueryResultRow & {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_liked: boolean;
  user2_liked: boolean;
  is_super_like: boolean;
  matched_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export class PostgresMatchRepository implements MatchRepository {
  async findBetweenUsers(userA: UserId, userB: UserId): Promise<Match | null> {
    const { rows } = await pool.query<MatchRow>(
      `SELECT * FROM matches
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)
       LIMIT 1`,
      [userA.toString(), userB.toString()]
    );
    const row = rows[0];
    if (!row) return null;
    return MatchRowToEntityMapper.map(row);
  }

  async save(match: Match): Promise<Match> {
    if (match.id) {
      const { rows } = await pool.query<MatchRow>(
        `UPDATE matches
         SET user1_liked = $2,
             user2_liked = $3,
             is_super_like = $4,
             matched_at = $5,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          match.id,
          match.user1Liked,
          match.user2Liked,
          match.isSuperLike,
          match.matchedAt ?? null,
        ]
      );
      const row = rows[0];
      if (!row) {
        throw new Error("Match update failed");
      }
      return MatchRowToEntityMapper.map(row);
    }

    const { rows } = await pool.query<MatchRow>(
      `INSERT INTO matches (
         user1_id,
         user2_id,
         user1_liked,
         user2_liked,
         is_super_like,
         matched_at
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        match.user1Id.toString(),
        match.user2Id.toString(),
        match.user1Liked,
        match.user2Liked,
        match.isSuperLike,
        match.matchedAt ?? null,
      ]
    );
    const row = rows[0];
    if (!row) {
      throw new Error("Match insertion failed");
    }
    const entity = MatchRowToEntityMapper.map(row);
    match.id = entity.id;
    return entity;
  }

  async listConfirmed(userId: UserId): Promise<Match[]> {
    const { rows } = await pool.query<MatchRow>(
      `SELECT * FROM matches
       WHERE (user1_id = $1 OR user2_id = $1)
         AND user1_liked = true
         AND user2_liked = true
       ORDER BY matched_at DESC NULLS LAST, updated_at DESC`,
      [userId.toString()]
    );
    return rows.map(MatchRowToEntityMapper.map);
  }
}

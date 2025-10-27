import { BaseService } from "../database/BaseService";
import { IMatch, Match } from "../../types";
import { getNotificationService } from "../notification/NotificationService";

// to-do: Acho que vale usar Factory Method aqui para criar diferentes tipos de MatchService
// (ex: MatchAlgorithmService, MatchNotificationService, MatchAnalyticsService) para separar responsabilidades
export class MatchService extends BaseService {
  async likeUser(
    userId: string,
    targetUserId: string,
    isSuperLike: boolean = false
  ): Promise<Match | null> {
    const result = await this.transaction(async () => {
      // verificar se já existe um registro de match
      const existingMatch = await this.query<IMatch>(
        `SELECT * FROM matches 
         WHERE (user1_id = $1 AND user2_id = $2)
         OR (user1_id = $2 AND user2_id = $1)`,
        [userId, targetUserId]
      );

      if (existingMatch.rows.length === 0) {
        // criar novo registro de match
        const result = await this.query<IMatch>(
          `INSERT INTO matches (user1_id, user2_id, user1_liked, is_super_like)
           VALUES ($1, $2, true, $3)
           RETURNING *`,
          [userId, targetUserId, isSuperLike]
        );
        return result.rows[0];
      } else {
        // atualizar registro de match existente
        const match = existingMatch.rows[0];
        const isUser1 = match.user1_id === userId;

        if (isUser1) {
          await this.query(
            `UPDATE matches 
             SET user1_liked = true, is_super_like = $3
             WHERE id = $1`,
            [match.id, isSuperLike]
          );
        } else {
          await this.query(
            `UPDATE matches 
             SET user2_liked = true, is_super_like = $3
             WHERE id = $1`,
            [match.id, isSuperLike]
          );
        }

        // verificar se ambos os usuários gostaram um do outro
        const updatedMatch = await this.query<IMatch>(
          `SELECT * FROM matches WHERE id = $1`,
          [match.id]
        );

        const updated = updatedMatch.rows[0];
        if (updated.user1_liked && updated.user2_liked) {
          await this.query(
            `UPDATE matches 
             SET matched_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [match.id]
          );
        }

        return updated;
      }
    });

    // enviar notificações
    const notificationService = getNotificationService();
    if (notificationService && result) {
      if (result.user1_liked && result.user2_liked) {
        notificationService.notifyMatch(result as Match);
      } else {
        notificationService.notifyLike(userId, targetUserId, isSuperLike);
      }
    }

    return result as Match;
  }

  async dislikeUser(userId: string, targetUserId: string): Promise<void> {
    await this.transaction(async () => {
      const existingMatch = await this.query<IMatch>(
        `SELECT * FROM matches 
         WHERE (user1_id = $1 AND user2_id = $2)
         OR (user1_id = $2 AND user2_id = $1)`,
        [userId, targetUserId]
      );

      if (existingMatch.rows.length === 0) {
        // criar novo registro de match com desgosto
        await this.query(
          `INSERT INTO matches (user1_id, user2_id, user1_liked)
           VALUES ($1, $2, false)`,
          [userId, targetUserId]
        );
      } else {
        // atualizar registro de match existente
        const match = existingMatch.rows[0];
        const isUser1 = match.user1_id === userId;

        if (isUser1) {
          await this.query(
            `UPDATE matches 
             SET user1_liked = false
             WHERE id = $1`,
            [match.id]
          );
        } else {
          await this.query(
            `UPDATE matches 
             SET user2_liked = false
             WHERE id = $1`,
            [match.id]
          );
        }
      }
    });
  }

  async getMatches(userId: string): Promise<Match[]> {
    const result = await this.query<IMatch>(
      `SELECT * FROM matches 
       WHERE (user1_id = $1 OR user2_id = $1)
       AND user1_liked = true AND user2_liked = true
       ORDER BY matched_at DESC`,
      [userId]
    );

    return result.rows as Match[];
  }
}

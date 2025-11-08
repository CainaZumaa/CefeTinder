import { BaseService } from "../database/BaseService";
import { IMatch, Match } from "../../types";
import { request, RequestOptions } from "http";

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
             SET user1_liked = true, is_super_like = $2
             WHERE id = $1`,
            [match.id, isSuperLike]
          );
        } else {
          await this.query(
            `UPDATE matches 
             SET user2_liked = true, is_super_like = $2
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

    // enviar notificações via HTTP
    if (result) {
      try {
        if (result.user1_liked && result.user2_liked) {
          await this.sendNotification("/notify/match", { match: result });
        } else {
          await this.sendNotification("/notify/like", {
            userId,
            targetUserId,
            isSuperLike,
          });
        }
      } catch (error) {
        // Loga o erro mas não impede a resposta para o usuário
        console.error("Failed to send notification:", error);
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

  private sendNotification(path: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;
      if (!NOTIFICATION_SERVICE_URL) {
        console.warn(
          "NOTIFICATION_SERVICE_URL is not set. Skipping notification."
        );
        return resolve();
      }

      try {
        const url = new URL(NOTIFICATION_SERVICE_URL);
        const postData = JSON.stringify(data);

        const options: RequestOptions = {
          hostname: url.hostname,
          port: url.port,
          path: path,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        };

        const req = request(options, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(
              new Error(`Request failed with status code: ${res.statusCode}`)
            );
          }
        });

        req.on("error", (e) => {
          console.error(`Problem with notification request: ${e.message}`);
          reject(e);
        });

        // Escreve os dados no corpo da requisição
        req.write(postData);
        req.end();
      } catch (error) {
        console.error("Failed to construct notification request", error);
        reject(error);
      }
    });
  }
}

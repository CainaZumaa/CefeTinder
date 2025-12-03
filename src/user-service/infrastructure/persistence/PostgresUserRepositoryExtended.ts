import { User } from "../../domain/entities/User";
import { PostgresUserRepository } from "./PostgresUserRepository";
import { pool } from "../database/DatabaseConnection";
import { UserEntityMapper } from "./mappers/UserEntityMapper";

/**
 * Extensão do repositório para incluir métodos específicos de queries
 * como getPotentialMatches que precisa acessar dados de matches
 *
 * Obs: Qnd tiver uma arquitetura de microserviços completa, getPotentialMatches
 * seria feito via comunicação com o MatchService. Por enquanto, mantemos
 * aqui p compatibilidade
 */
export class PostgresUserRepositoryExtended extends PostgresUserRepository {
  /**
   * Busca matches potenciais baseado na pref do usuário
   *
   * Obs: Esta query acessa a tabela matches que está no mesmo banco.
   * Em prod, isso seria feito via comunicação entre microserviços.
   */
  async findPotentialMatches(userId: string): Promise<User[]> {
    const result = await pool.query(
      `SELECT u.*
       FROM users u
       JOIN users_preferences up ON u.id = up.user_id
       WHERE u.id != $1
       AND u.age BETWEEN
         (SELECT min_age FROM users_preferences WHERE user_id = $1)
         AND
         (SELECT max_age FROM users_preferences WHERE user_id = $1)
       AND (
         (SELECT gender_preference FROM users_preferences WHERE user_id = $1) IS NULL
         OR u.gender = (SELECT gender_preference FROM users_preferences WHERE user_id = $1)
       )
       AND NOT EXISTS (
         SELECT 1 FROM matches m
         WHERE (m.user1_id = $1 AND m.user2_id = u.id)
         OR (m.user2_id = $1 AND m.user1_id = u.id)
       )`,
      [userId]
    );

    return result.rows.map((row) => UserEntityMapper.toDomain(row));
  }
}

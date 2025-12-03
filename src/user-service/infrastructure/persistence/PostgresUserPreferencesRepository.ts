import { UserPreferences } from "../../domain/entities/UserPreferences";
import { IUserPreferencesRepository } from "../../domain/repositories/IUserRepository";
import { pool } from "../database/DatabaseConnection";
import { UserEntityMapper } from "./mappers/UserEntityMapper";

// Implementação do repositório de preferências usando PostgreSQL
// Camada de Infrastructure

export class PostgresUserPreferencesRepository
  implements IUserPreferencesRepository
{
  async save(preferences: UserPreferences): Promise<void> {
    const data = UserEntityMapper.preferencesToPersistence(preferences);

    await pool.query(
      `INSERT INTO users_preferences (user_id, min_age, max_age, gender_preference, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         min_age = EXCLUDED.min_age,
         max_age = EXCLUDED.max_age,
         gender_preference = EXCLUDED.gender_preference,
         updated_at = EXCLUDED.updated_at`,
      [
        data.user_id,
        data.min_age,
        data.max_age,
        data.gender_preference,
        data.created_at,
        data.updated_at,
      ]
    );
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const result = await pool.query(
      "SELECT * FROM users_preferences WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return UserEntityMapper.preferencesToDomain(result.rows[0]);
  }

  async delete(userId: string): Promise<void> {
    await pool.query("DELETE FROM users_preferences WHERE user_id = $1", [
      userId,
    ]);
  }
}

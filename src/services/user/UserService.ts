import { BaseService } from "../database/BaseService";
import { supabase } from "../../config/supabase";
import { IUser, IUserPreferences, User } from "../../types";

// to-do: Acho que vale usar Factory Method aqui para criar diferentes tipos de UserService
// (ex: UserReadService, UserWriteService, UserAdminService) para separar responsabilidades
export class UserService extends BaseService {
  async createUser(userData: Partial<IUser>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.query<IUser>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return (result.rows[0] as User) || null;
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<void> {
    await this.transaction(async (client) => {
      const existingPrefs = await client.query(
        "SELECT * FROM users_preferences WHERE user_id = $1",
        [userId]
      );

      if (existingPrefs.rows.length === 0) {
        await client.query(
          `INSERT INTO users_preferences 
            (user_id, min_age, max_age, gender_preference)
            VALUES ($1, $2, $3, $4)`,
          [
            userId,
            preferences.min_age,
            preferences.max_age,
            preferences.gender_preference,
          ]
        );
      } else {
        await client.query(
          `UPDATE users_preferences 
            SET min_age = COALESCE($2, min_age),
                max_age = COALESCE($3, max_age),
                gender_preference = COALESCE($4, gender_preference)
            WHERE user_id = $1`,
          [
            userId,
            preferences.min_age,
            preferences.max_age,
            preferences.gender_preference,
          ]
        );
      }
    });
  }

  async getPotentialMatches(userId: string): Promise<User[]> {
    const result = await this.query<IUser>(
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

    return result.rows as User[];
  }
}

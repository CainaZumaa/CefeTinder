import { SupabaseClient } from "@supabase/supabase-js";
import { IUser, IUserPreferences, User } from "../../types";
import { BaseUserRepository } from "./BaseUserRepository";

// Liskov Substitution: pode ser usado em qqr lugar onde BaseUserRepository é esperado
export class SupabaseUserRepository extends BaseUserRepository {
  constructor(private supabase: SupabaseClient) {
    super();
  }

  async createUser(userData: Partial<IUser>): Promise<User> {
    const { data, error } = await this.supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // não foi encontrado nenhum registro
      throw error;
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // não foi encontrado nenhum registro
      throw error;
    }
    return data as User;
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<void> {
    // Check if preferences exist
    const { data: existingPrefs, error: fetchError } = await this.supabase
      .from("users_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (!existingPrefs) {
      // Insert new preferences
      const { error } = await this.supabase.from("users_preferences").insert([
        {
          user_id: userId,
          min_age: preferences.min_age,
          max_age: preferences.max_age,
          gender_preference: preferences.gender_preference,
        },
      ]);
      if (error) throw error;
    } else {
      // Update existing preferences
      const { error } = await this.supabase
        .from("users_preferences")
        .update({
          min_age: preferences.min_age ?? existingPrefs.min_age,
          max_age: preferences.max_age ?? existingPrefs.max_age,
          gender_preference:
            preferences.gender_preference ?? existingPrefs.gender_preference,
        })
        .eq("user_id", userId);
      if (error) throw error;
    }
  }

  async getPotentialMatches(userId: string): Promise<User[]> {
    // First, get user's preferences
    const { data: userPrefs, error: prefsError } = await this.supabase
      .from("users_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (prefsError) throw prefsError;

    // Build query for potential matches
    let query = this.supabase
      .from("users")
      .select("*")
      .neq("id", userId)
      .gte("age", userPrefs.min_age)
      .lte("age", userPrefs.max_age);

    if (userPrefs.gender_preference) {
      query = query.eq("gender", userPrefs.gender_preference);
    }

    // Exclude already matched users
    const { data: matches, error: matchesError } = await this.supabase
      .from("matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (matchesError) throw matchesError;

    const excludedIds = matches.map((m) =>
      m.user1_id === userId ? m.user2_id : m.user1_id
    );

    if (excludedIds.length > 0) {
      query = query.not("id", "in", `(${excludedIds.join(",")})`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as User[];
  }
}

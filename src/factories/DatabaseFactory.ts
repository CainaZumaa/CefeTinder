import { IUserRepository } from "../repositories/user/interface";
import { PostgresUserRepository } from "../repositories/user/PostgresUserRepository";
import { SupabaseUserRepository } from "../repositories/user/SupabaseUserRepository";
import { getSupabaseClient } from "../config/supabase";

export type DatabaseType = "postgres" | "supabase";

export class DatabaseClientFactory {
  static createUserRepository(type: DatabaseType): IUserRepository {
    switch (type) {
      case "postgres":
        return new PostgresUserRepository();
      case "supabase":
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error("Supabase client is not initialized");
        }
        return new SupabaseUserRepository(supabase);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}
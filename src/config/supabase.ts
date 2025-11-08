import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabaseClient: SupabaseClient | null = null;
export function getSupabaseClient() {
  // Only create client if credentials are provided (optional)
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn(
      "Supabase credentials not configured - SupabaseUserRepository will not work"
    );
    return null;
  }

  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL as string;
    const anonKey = process.env.SUPABASE_ANON_KEY as string;
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

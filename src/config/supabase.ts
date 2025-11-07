import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

let supabaseClient: SupabaseClient | null = null;
export function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL as string;
    const anonKey = process.env.SUPABASE_ANON_KEY as string;
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

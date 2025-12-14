import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.MATCH_SERVICE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing MATCH_SERVICE_DATABASE_URL or DATABASE_URL environment variable"
  );
}

export const pool = new Pool({
  connectionString,
  ssl: false,
});

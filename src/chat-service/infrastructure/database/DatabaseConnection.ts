import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

//Configuração de conexão com banco de dados
//Camada de Infrastructure
//Banco específico do UserService (Database per Service)

// Usa USER_SERVICE_DATABASE_URL se disponível, senão usa DATABASE_URL como fallback
const databaseUrl =
  process.env.USER_SERVICE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Missing USER_SERVICE_DATABASE_URL or DATABASE_URL environment variable"
  );
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
});
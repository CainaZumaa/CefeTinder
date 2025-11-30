import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { pool } from "../database/DatabaseConnection";
import { UserEntityMapper } from "./mappers/UserEntityMapper";

// Implementação do repositório de usuários usando PostgreSQL
// Camada de Infrastructure

export class PostgresUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    const data = UserEntityMapper.toPersistence(user);

    await pool.query(
      `INSERT INTO users (id, name, email, age, gender, bio, last_super_like, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         age = EXCLUDED.age,
         gender = EXCLUDED.gender,
         bio = EXCLUDED.bio,
         last_super_like = EXCLUDED.last_super_like,
         updated_at = EXCLUDED.updated_at`,
      [
        data.id,
        data.name,
        data.email,
        data.age,
        data.gender,
        data.bio,
        data.last_super_like,
        data.created_at,
        data.updated_at,
      ]
    );
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return UserEntityMapper.toDomain(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return UserEntityMapper.toDomain(result.rows[0]);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await pool.query(
      "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    return result.rows.length > 0;
  }

  async delete(id: string): Promise<void> {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  }
}

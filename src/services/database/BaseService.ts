import { pool } from "../../config/database";
import { QueryResult, QueryResultRow } from "pg";

// to-do: Acho que vale usar Factory Method aqui para criar diferentes tipos de conexões
// (ex: read-only, write-only, transaction) para melhorar performance e organização
export class BaseService {
  protected async query<T extends QueryResultRow>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const client = await pool.connect();
    try {
      return await client.query<T>(text, params);
    } finally {
      client.release();
    }
  }

  protected async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

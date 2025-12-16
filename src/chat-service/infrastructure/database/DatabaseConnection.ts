import { Pool, PoolClient } from 'pg';

export class DatabaseConnection {
    private pool: Pool;
    private client: PoolClient | null = null;

    constructor(config: any) {
        this.pool = new Pool(config);
    }

    async connect(): Promise<PoolClient> {
        if (!this.client) {
            this.client = await this.pool.connect();
        }
        return this.client;
    }

    async query(text: string, params?: any[]): Promise<any> {
        const client = await this.connect();
        return client.query(text, params);
    }

    async beginTransaction(): Promise<void> {
        const client = await this.connect();
        await client.query('BEGIN');
    }

    async commit(): Promise<void> {
        const client = await this.connect();
        await client.query('COMMIT');
    }

    async rollback(): Promise<void> {
        const client = await this.connect();
        await client.query('ROLLBACK');
    }

    async release(): Promise<void> {
        if (this.client) {
            this.client.release();
            this.client = null;
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
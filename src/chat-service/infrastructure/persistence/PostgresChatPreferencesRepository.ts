import { DatabaseConnection } from '../database/DatabaseConnection';

export class PostgresChatPreferencesRepository {
    constructor(private readonly db: DatabaseConnection) {}

    async saveUserPreferences(userId: string, preferences: any): Promise<void> {
        await this.db.query(
            `INSERT INTO user_chat_preferences (user_id, preferences, updated_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id) DO UPDATE
             SET preferences = $2, updated_at = $3`,
            [userId, JSON.stringify(preferences), new Date()]
        );
    }

    async getUserPreferences(userId: string): Promise<any> {
        const result = await this.db.query(
            'SELECT preferences FROM user_chat_preferences WHERE user_id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return JSON.parse(result.rows[0].preferences);
    }

    async updateNotificationSettings(userId: string, settings: any): Promise<void> {
        await this.db.query(
            `INSERT INTO notification_settings (user_id, message_notifications, read_receipts, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id) DO UPDATE
             SET message_notifications = $2, read_receipts = $3, updated_at = $5`,
            [userId, settings.message_notifications, settings.read_receipts, new Date(), new Date()]
        );
    }

    async getNotificationSettings(userId: string): Promise<any> {
        const result = await this.db.query(
            'SELECT message_notifications, read_receipts FROM notification_settings WHERE user_id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return { message_notifications: true, read_receipts: true };
        }
        
        return result.rows[0];
    }
}
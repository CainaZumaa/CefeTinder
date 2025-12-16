export interface ConversationDTO {
    id: string;
    participants: string[];
    lastMessageAt: Date;
    messageCount: number;
}
export class ChatWebSocketMapper {
    static toMessageResponse(message: any) {
        return {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            chatRoomId: message.chatRoomId,
            sentAt: message.sentAt,
            readAt: message.readAt,
            isRead: message.isRead
        };
    }

    static toConversationResponse(conversation: any) {
        return {
            id: conversation.id,
            participants: conversation.participants,
            lastMessageAt: conversation.lastMessageAt,
            messageCount: conversation.messageCount
        };
    }

    static toErrorResponse(error: Error) {
        return {
            error: error.name,
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }

    static toConnectionStatus(userId: string, status: string) {
        return {
            userId,
            status,
            timestamp: new Date().toISOString()
        };
    }
}
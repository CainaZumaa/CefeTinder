export interface MessageDTO {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatRoomId: string;
    sentAt: Date;
    readAt: Date | null;
    isRead: boolean;
}
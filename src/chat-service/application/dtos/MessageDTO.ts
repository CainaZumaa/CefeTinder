export interface MessageDTO {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  replyTo?: string;
  metadata: Record<string, any>;
  isEdited?: boolean;
  editedAt?: string;
  deletedFor?: string[];
}

export interface SendMessageRequestDTO {
  receiverId: string;
  content: string;
  roomId?: string;
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageResponseDTO {
  message: MessageDTO;
  correlationId?: string;
  timestamp: string;
}

export interface MessageStatusUpdateDTO {
  messageId: string;
  status: 'delivered' | 'read';
  updatedAt: string;
  updatedBy?: string;
}

export interface TypingIndicatorDTO {
  userId: string;
  roomId: string;
  isTyping: boolean;
  timestamp: string;
}
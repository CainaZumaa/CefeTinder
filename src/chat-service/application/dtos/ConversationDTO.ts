export interface ParticipantDTO {
  userId: string;
  joinedAt: string;
  isActive: boolean;
  lastSeen?: string;
  role?: 'member' | 'admin' | 'owner';
}

export interface ConversationDTO {
  roomId: string;
  participants: ParticipantDTO[];
  isGroup: boolean;
  groupName?: string;
  groupDescription?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    sentAt: string;
    status: string;
  };
  unreadCount: number;
  typingUsers: string[];
  metadata: Record<string, any>;
  settings?: {
    allowNewMembers: boolean;
    onlyAdminsCanPost: boolean;
    messageHistoryVisible: boolean;
  };
}

export interface ConversationSummaryDTO {
  roomId: string;
  participants: Array<{
    id: string;
    username: string;
    avatarUrl?: string;
    isOnline: boolean;
  }>;
  isGroup: boolean;
  groupName?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: string;
    status: string;
  };
  unreadCount: number;
  updatedAt: string;
  typingUsers: string[];
}

export interface CreateConversationRequestDTO {
  participantIds: string[];
  isGroup: boolean;
  groupName?: string;
  groupDescription?: string;
  metadata?: Record<string, any>;
}

export interface CreateConversationResponseDTO {
  conversation: ConversationDTO;
  timestamp: string;
}
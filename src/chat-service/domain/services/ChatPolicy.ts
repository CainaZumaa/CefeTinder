import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { SenderId } from "../value-objects/SenderId";
import { ReceiverId } from "../value-objects/ReceiverId";

export interface ChatPolicyConfig {
  maxMessageLength: number;
  maxParticipants: number;
  allowGroupCreation: boolean;
  allowFileSharing: boolean;
  allowVoiceMessages: boolean;
  messageRetentionDays: number;
  typingIndicatorTimeout: number; // em segundos
}

export class ChatPolicy {
  private config: ChatPolicyConfig = {
    maxMessageLength: 5000,
    maxParticipants: 100,
    allowGroupCreation: true,
    allowFileSharing: true,
    allowVoiceMessages: true,
    messageRetentionDays: 30,
    typingIndicatorTimeout: 5,
  };

  constructor(config?: Partial<ChatPolicyConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  canSendMessage(
    senderId: SenderId,
    receiverId: ReceiverId,
    conversation: Conversation
  ): { allowed: boolean; reason?: string } {
    // Verificar se o remetente está bloqueado
    if (this.isUserBlocked(senderId.value, receiverId.value)) {
      return { allowed: false, reason: "You are blocked by this user" };
    }

    // Verificar se o receptor está bloqueado
    if (this.isUserBlocked(receiverId.value, senderId.value)) {
      return { allowed: false, reason: "You have blocked this user" };
    }

    // Verificar se o remetente está na conversa
    if (!conversation.isParticipant(senderId.value)) {
      return {
        allowed: false,
        reason: "You are not a participant in this conversation",
      };
    }

    // Para conversas diretas, verificar se o receptor está na conversa
    if (
      !conversation.isGroup &&
      !conversation.isParticipant(receiverId.value)
    ) {
      return {
        allowed: false,
        reason: "Receiver is not a participant in this conversation",
      };
    }

    // Verificar se a conversa está arquivada
    if (this.isConversationArchived(conversation.roomId.value)) {
      return { allowed: false, reason: "This conversation is archived" };
    }

    return { allowed: true };
  }

  canCreateGroup(
    creatorId: string,
    participants: string[]
  ): { allowed: boolean; reason?: string } {
    if (!this.config.allowGroupCreation) {
      return { allowed: false, reason: "Group creation is disabled" };
    }

    if (participants.length < 2) {
      return {
        allowed: false,
        reason: "Group must have at least 2 participants",
      };
    }

    if (participants.length > this.config.maxParticipants) {
      return {
        allowed: false,
        reason: `Group cannot have more than ${this.config.maxParticipants} participants`,
      };
    }

    // Verificar se o criador pode criar grupos
    if (!this.canUserCreateGroups(creatorId)) {
      return { allowed: false, reason: "You are not allowed to create groups" };
    }

    return { allowed: true };
  }

  canAddParticipant(
    requesterId: string,
    conversation: Conversation,
    userIdToAdd: string
  ): { allowed: boolean; reason?: string } {
    if (!conversation.isGroup) {
      return {
        allowed: false,
        reason: "Cannot add participants to direct conversation",
      };
    }

    if (conversation.participants.length >= this.config.maxParticipants) {
      return {
        allowed: false,
        reason: `Group cannot have more than ${this.config.maxParticipants} participants`,
      };
    }

    if (conversation.isParticipant(userIdToAdd)) {
      return { allowed: false, reason: "User is already a participant" };
    }

    // Verificar se o solicitante tem permissão para adicionar participantes
    if (!this.canUserManageGroup(requesterId, conversation.roomId.value)) {
      return {
        allowed: false,
        reason: "You are not allowed to add participants",
      };
    }

    // Verificar se o usuário está bloqueado por algum participante
    for (const participant of conversation.participants) {
      if (this.isUserBlocked(participant.userId, userIdToAdd)) {
        return {
          allowed: false,
          reason: "This user is blocked by a group member",
        };
      }
    }

    return { allowed: true };
  }

  canDeleteMessage(
    userId: string,
    message: Message
  ): { allowed: boolean; reason?: string } {
    if (message.isFromUser(userId)) {
      return { allowed: true };
    }

    // Verificar se o usuário é administrador do grupo
    if (this.isGroupAdmin(userId, message.roomId.value)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "You are not allowed to delete this message",
    };
  }

  canEditMessage(
    userId: string,
    message: Message
  ): { allowed: boolean; reason?: string } {
    if (!message.isFromUser(userId)) {
      return { allowed: false, reason: "Only the sender can edit a message" };
    }

    // Verificar se a mensagem pode ser editada (dentro do tempo limite)
    const editTimeLimit = 2 * 60 * 1000; // 2 minutos
    const now = Date.now();
    const messageTime = message.sentAt.milliseconds;

    if (now - messageTime > editTimeLimit) {
      return {
        allowed: false,
        reason: "Message can only be edited within 2 minutes of sending",
      };
    }

    return { allowed: true };
  }

  private isUserBlocked(blockerId: string, blockedId: string): boolean {
    // Implementar lógica de verificação de bloqueio
    // Pode ser integrado com um serviço externo
    return false;
  }

  private isConversationArchived(roomId: string): boolean {
    // Implementar lógica de verificação de arquivamento
    return false;
  }

  private canUserCreateGroups(userId: string): boolean {
    // Implementar lógica de permissão para criar grupos
    return true;
  }

  private canUserManageGroup(userId: string, roomId: string): boolean {
    // Implementar lógica de permissão para gerenciar grupos
    return true;
  }

  private isGroupAdmin(userId: string, roomId: string): boolean {
    // Implementar lógica de verificação de administrador
    return false;
  }

  getConfig(): ChatPolicyConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<ChatPolicyConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

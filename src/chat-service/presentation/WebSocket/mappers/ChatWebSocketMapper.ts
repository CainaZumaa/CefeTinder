import { IUserRepository } from "../../../../repositories/user/interface";

export interface JoinValidation {
  valid: boolean;
  error?: string;
}

export interface MessageValidation {
  valid: boolean;
  error?: string;
}

export class ChatWebSocketMapper {
  validateJoinRequest(room: string, email: string): JoinValidation {
    if (!room || !email) {
      return { valid: false, error: "Dados inválidos para entrar na sala" };
    }

    if (room.length > 50) {
      return { valid: false, error: "Nome da sala muito longo" };
    }

    return { valid: true };
  }

  validateMessage(user: IUserRepository | undefined, room: string, texto: string): MessageValidation {
    if (!user) {
      return { valid: false, error: "Você precisa entrar em uma sala primeiro" };
    }

    if (!room) {
      return { valid: false, error: "Sala não especificada" };
    }

    const mensagemTrimmed = texto.trim();
    if (!mensagemTrimmed) {
      return { valid: false, error: "Mensagem vazia" };
    }

    if (mensagemTrimmed.length > 1000) {
      return { valid: false, error: "Mensagem muito longa (máximo 1000 caracteres)" };
    }

    return { valid: true };
  }

  mapToMessagePayload(user: IUserRepository, texto: string) {
    return {
      de: user.getUserByEmail,
      email: user.getUserByEmail,
      texto,
      ts: Date.now(),
    };
  }

  mapToUserResponse(user: IUserRepository | undefined) {
    return user ? {
      email: user.getUserByEmail,
      id: user.getUserById
    } : null;
  }
}
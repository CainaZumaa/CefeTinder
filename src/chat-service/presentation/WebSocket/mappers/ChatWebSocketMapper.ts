import { IUser } from "../../../../types";

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

  validateMessage(
    user: IUser | undefined,
    room: string,
    texto: string
  ): MessageValidation {
    if (!user) {
      return {
        valid: false,
        error: "Você precisa entrar em uma sala primeiro",
      };
    }

    if (!room) {
      return { valid: false, error: "Sala não especificada" };
    }

    const mensagemTrimmed = texto.trim();
    if (!mensagemTrimmed) {
      return { valid: false, error: "Mensagem vazia" };
    }

    if (mensagemTrimmed.length > 1000) {
      return {
        valid: false,
        error: "Mensagem muito longa (máximo 1000 caracteres)",
      };
    }

    return { valid: true };
  }

  mapToMessagePayload(user: IUser, texto: string) {
    return {
      de: user.name,
      email: user.email,
      texto,
      ts: Date.now(),
    };
  }

  mapToUserResponse(user: IUser | undefined) {
    return user
      ? {
          name: user.name,
          email: user.email,
          id: user.id,
        }
      : null;
  }
}

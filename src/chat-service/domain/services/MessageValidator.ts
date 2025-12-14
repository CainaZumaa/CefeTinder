import { MessageValidationException } from "../exceptions/MessageValidationException";

export interface ValidationRule {
  validate(content: string): boolean;
  errorMessage: string;
}

export class MessageValidator {
  private readonly rules: ValidationRule[] = [
    {
      validate: (content: string) => content.trim().length > 0,
      errorMessage: "Message cannot be empty",
    },
    {
      validate: (content: string) => content.length <= 5000,
      errorMessage: "Message cannot exceed 5000 characters",
    },
    {
      validate: (content: string) => !this.containsSpam(content),
      errorMessage: "Message contains spam content",
    },
    {
      validate: (content: string) => !this.containsMaliciousContent(content),
      errorMessage: "Message contains malicious content",
    },
    {
      validate: (content: string) => this.isRateLimited(),
      errorMessage: "Message rate limit exceeded",
    },
  ];

  private lastMessageTimes: Map<string, number[]> = new Map();
  private readonly RATE_LIMIT = 10; // mensagens
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto em milissegundos

  validate(content: string, senderId: string): void {
    for (const rule of this.rules) {
      if (!rule.validate(content)) {
        throw new MessageValidationException(rule.errorMessage);
      }
    }

    this.updateRateLimit(senderId);
  }

  private containsSpam(content: string): boolean {
    const spamPatterns = [
      /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z]{2,}){1,}/gi,
      /(free|money|cash|prize|winner|click here)/gi,
      /([!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]{5,})/,
    ];

    return spamPatterns.some((pattern) => pattern.test(content));
  }

  private containsMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\(/gi,
      /document\./gi,
      /window\./gi,
      /alert\(/gi,
    ];

    return maliciousPatterns.some((pattern) => pattern.test(content));
  }

  private isRateLimited(): boolean {
    // Implementação genérica - deve ser sobrescrita com lógica específica
    return true;
  }

  private updateRateLimit(senderId: string): void {
    const now = Date.now();
    const userMessages = this.lastMessageTimes.get(senderId) || [];

    // Remover mensagens fora da janela de tempo
    const recentMessages = userMessages.filter(
      (time) => now - time < this.RATE_LIMIT_WINDOW
    );

    if (recentMessages.length >= this.RATE_LIMIT) {
      throw new MessageValidationException(
        "Rate limit exceeded. Please wait before sending more messages."
      );
    }

    recentMessages.push(now);
    this.lastMessageTimes.set(senderId, recentMessages);
  }

  canSendMessage(senderId: string): boolean {
    const userMessages = this.lastMessageTimes.get(senderId) || [];
    const now = Date.now();
    const recentMessages = userMessages.filter(
      (time) => now - time < this.RATE_LIMIT_WINDOW
    );

    return recentMessages.length < this.RATE_LIMIT;
  }

  getRemainingMessages(senderId: string): number {
    const userMessages = this.lastMessageTimes.get(senderId) || [];
    const now = Date.now();
    const recentMessages = userMessages.filter(
      (time) => now - time < this.RATE_LIMIT_WINDOW
    );

    return Math.max(0, this.RATE_LIMIT - recentMessages.length);
  }

  resetRateLimit(senderId: string): void {
    this.lastMessageTimes.delete(senderId);
  }
}

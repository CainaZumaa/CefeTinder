export class ChatDomainException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'CHAT_DOMAIN_ERROR',
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ChatDomainException';
    
    // Manter o stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChatDomainException);
    }
  }

  static fromError(error: Error, code?: string): ChatDomainException {
    return new ChatDomainException(
      error.message,
      code || 'CHAT_DOMAIN_ERROR',
      { originalError: error.name }
    );
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack
    };
  }
}
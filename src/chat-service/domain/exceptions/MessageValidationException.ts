import { ChatDomainException } from './ChatDomainException';

export class MessageValidationException extends ChatDomainException {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message, 'MESSAGE_VALIDATION_ERROR', {
      field,
      value,
      timestamp: new Date().toISOString()
    });
    this.name = 'MessageValidationException';
  }

  static emptyContent(): MessageValidationException {
    return new MessageValidationException(
      'Message content cannot be empty',
      'content',
      ''
    );
  }

  static tooLong(maxLength: number, actualLength: number): MessageValidationException {
    return new MessageValidationException(
      `Message cannot exceed ${maxLength} characters`,
      'content',
      actualLength
    );
  }

  static spamDetected(): MessageValidationException {
    return new MessageValidationException(
      'Message contains spam content',
      'content',
      'SPAM_DETECTED'
    );
  }

  static maliciousContent(): MessageValidationException {
    return new MessageValidationException(
      'Message contains malicious content',
      'content',
      'MALICIOUS_CONTENT_DETECTED'
    );
  }

  static rateLimitExceeded(
    limit: number,
    windowSeconds: number
  ): MessageValidationException {
    return new MessageValidationException(
      `Rate limit exceeded. Maximum ${limit} messages per ${windowSeconds} seconds`,
      'rate_limit',
      { limit, windowSeconds }
    );
  }
}
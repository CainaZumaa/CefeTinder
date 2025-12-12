export class MessageId {
  private constructor(private readonly id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('Message ID cannot be empty');
    }
    if (id.length > 50) {
      throw new Error('Message ID cannot exceed 50 characters');
    }
  }

  static create(id: string): MessageId {
    return new MessageId(id);
  }

  static generate(): MessageId {
    return new MessageId(`msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }

  get value(): string {
    return this.id;
  }

  equals(other: MessageId): boolean {
    return this.id === other.value;
  }

  toString(): string {
    return this.id;
  }
}
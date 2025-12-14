export interface MarkAsReadUseCase {
  readonly messageId: string;
  readonly readerId: string;
  readonly roomId: string;
  readonly readAt?: string;
  readonly correlationId?: string;
}

export class MarkAsReadUseCase implements MarkAsReadUseCase {
  constructor(
    public readonly messageId: string,
    public readonly readerId: string,
    public readonly roomId: string,
    public readonly readAt?: string,
    public readonly correlationId?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.messageId || this.messageId.trim().length === 0) {
      throw new Error("Message ID is required");
    }
    if (!this.readerId || this.readerId.trim().length === 0) {
      throw new Error("Reader ID is required");
    }
    if (!this.roomId || this.roomId.trim().length === 0) {
      throw new Error("Room ID is required");
    }
    if (this.readAt) {
      const date = new Date(this.readAt);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid readAt date format");
      }
    }
  }

  toJSON(): Record<string, any> {
    return {
      messageId: this.messageId,
      readerId: this.readerId,
      roomId: this.roomId,
      readAt: this.readAt || new Date().toISOString(),
      correlationId: this.correlationId,
    };
  }
}

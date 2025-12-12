export interface UpdateTypingStatusUseCase {
  userId: string;
  roomId: string;
  isTyping: boolean;
  correlationId?: string;
}

export class UpdateTypingStatusUseCase implements UpdateTypingStatusUseCase {
  constructor(
    public readonly userId: string,
    public readonly roomId: string,
    public readonly isTyping: boolean,
    public readonly correlationId?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    if (!this.roomId || this.roomId.trim().length === 0) {
      throw new Error('Room ID is required');
    }
  }

  toJSON(): Record<string, any> {
    return {
      userId: this.userId,
      roomId: this.roomId,
      isTyping: this.isTyping,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString()
    };
  }
}
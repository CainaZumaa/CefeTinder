export interface DeleteMessageUseCase {
  readonly messageId: string;
  readonly userId: string;
  readonly roomId: string;
  readonly deleteForEveryone: boolean;
  readonly correlationId?: string;
}

export class DeleteMessageUseCase implements DeleteMessageUseCase {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
    public readonly roomId: string,
    public readonly deleteForEveryone: boolean = false,
    public readonly correlationId?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.messageId || this.messageId.trim().length === 0) {
      throw new Error("Message ID is required");
    }
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    if (!this.roomId || this.roomId.trim().length === 0) {
      throw new Error("Room ID is required");
    }
  }

  toJSON(): Record<string, any> {
    return {
      messageId: this.messageId,
      userId: this.userId,
      roomId: this.roomId,
      deleteForEveryone: this.deleteForEveryone,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}

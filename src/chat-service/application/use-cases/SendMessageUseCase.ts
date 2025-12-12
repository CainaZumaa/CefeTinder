export interface SendMessageUseCase {
  senderId: string;
  receiverId: string;
  roomId: string;
  content: string;
  replyTo?: string;
  metadata?: Record<string, any>;
  correlationId?: string;
}

export class SendMessageUseCase implements SendMessageUseCase {
  constructor(
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly roomId: string,
    public readonly content: string,
    public readonly replyTo?: string,
    public readonly metadata?: Record<string, any>,
    public readonly correlationId?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.senderId || this.senderId.trim().length === 0) {
      throw new Error('Sender ID is required');
    }
    if (!this.receiverId || this.receiverId.trim().length === 0) {
      throw new Error('Receiver ID is required');
    }
    if (!this.roomId || this.roomId.trim().length === 0) {
      throw new Error('Room ID is required');
    }
    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Content is required');
    }
    if (this.content.length > 5000) {
      throw new Error('Content cannot exceed 5000 characters');
    }
  }

  toJSON(): Record<string, any> {
    return {
      senderId: this.senderId,
      receiverId: this.receiverId,
      roomId: this.roomId,
      content: this.content,
      replyTo: this.replyTo,
      metadata: this.metadata,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString()
    };
  }
}
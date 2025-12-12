export interface CreateConversationUseCase {
  creatorId: string;
  participantIds: string[];
  isGroup: boolean;
  groupName?: string;
  metadata?: Record<string, any>;
  correlationId?: string;
}

export class CreateConversationUseCase implements CreateConversationUseCase {
  constructor(
    public readonly creatorId: string,
    public readonly participantIds: string[],
    public readonly isGroup: boolean = false,
    public readonly groupName?: string,
    public readonly metadata?: Record<string, any>,
    public readonly correlationId?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.creatorId || this.creatorId.trim().length === 0) {
      throw new Error('Creator ID is required');
    }
    if (!this.participantIds || this.participantIds.length === 0) {
      throw new Error('At least one participant is required');
    }
    if (!this.participantIds.includes(this.creatorId)) {
      this.participantIds.push(this.creatorId);
    }
    if (this.isGroup && this.participantIds.length < 2) {
      throw new Error('Group must have at least 2 participants');
    }
    if (!this.isGroup && this.participantIds.length !== 2) {
      throw new Error('Direct conversation must have exactly 2 participants');
    }
  }

  toJSON(): Record<string, any> {
    return {
      creatorId: this.creatorId,
      participantIds: this.participantIds,
      isGroup: this.isGroup,
      groupName: this.groupName,
      metadata: this.metadata,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString()
    };
  }
}
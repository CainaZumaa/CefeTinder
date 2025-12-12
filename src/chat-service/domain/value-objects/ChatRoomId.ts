export class ChatRoomId {
  private constructor(private readonly id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('Chat room ID cannot be empty');
    }
    if (!this.isValidRoomId(id)) {
      throw new Error('Invalid chat room ID format');
    }
  }

  private isValidRoomId(id: string): boolean {
    // Room ID pode ser: direct_{userId1}_{userId2} ou group_{groupId}
    return /^(direct_[a-zA-Z0-9_-]+_[a-zA-Z0-9_-]+|group_[a-zA-Z0-9_-]+)$/.test(id);
  }

  static create(id: string): ChatRoomId {
    return new ChatRoomId(id);
  }

  static createDirect(userId1: string, userId2: string): ChatRoomId {
    const sortedIds = [userId1, userId2].sort();
    return new ChatRoomId(`direct_${sortedIds[0]}_${sortedIds[1]}`);
  }

  static createGroup(groupId: string): ChatRoomId {
    return new ChatRoomId(`group_${groupId}`);
  }

  get value(): string {
    return this.id;
  }

  isDirect(): boolean {
    return this.id.startsWith('direct_');
  }

  isGroup(): boolean {
    return this.id.startsWith('group_');
  }

  get participants(): string[] {
    if (this.isDirect()) {
      return this.id.replace('direct_', '').split('_');
    }
    return [];
  }

  equals(other: ChatRoomId): boolean {
    return this.id === other.value;
  }

  toString(): string {
    return this.id;
  }
}
export class ReceiverId {
  private constructor(private readonly id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('Receiver ID cannot be empty');
    }
    if (!this.isValidId(id)) {
      throw new Error('Invalid receiver ID format');
    }
  }

  private isValidId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 100;
  }

  static create(id: string): ReceiverId {
    return new ReceiverId(id);
  }

  get value(): string {
    return this.id;
  }

  equals(other: ReceiverId): boolean {
    return this.id === other.value;
  }

  toString(): string {
    return this.id;
  }
}
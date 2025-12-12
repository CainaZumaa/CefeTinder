export class Content {
  private readonly content: string;
  private readonly MAX_LENGTH = 5000;

  private constructor(content: string) {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    if (content.length > this.MAX_LENGTH) {
      throw new Error(`Content cannot exceed ${this.MAX_LENGTH} characters`);
    }
    
    // Remove excess whitespace but preserve intentional formatting
    this.content = content.trim();
  }

  static create(content: string): Content {
    return new Content(content);
  }

  get value(): string {
    return this.content;
  }

  get length(): number {
    return this.content.length;
  }

  isEmpty(): boolean {
    return this.content.length === 0;
  }

  equals(other: Content): boolean {
    return this.content === other.value;
  }

  toString(): string {
    return this.content;
  }
}
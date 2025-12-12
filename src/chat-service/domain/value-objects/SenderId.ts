export class SenderId {
  private constructor(private readonly id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('Sender ID cannot be empty');
    }
    // Validar formato de ID (pode ser UUID ou outro formato específico)
    if (!this.isValidId(id)) {
      throw new Error('Invalid sender ID format');
    }
  }

  private isValidId(id: string): boolean {
    // Implementar lógica de validação específica
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 100;
  }

  static create(id: string): SenderId {
    return new SenderId(id);
  }

  get value(): string {
    return this.id;
  }

  equals(other: SenderId): boolean {
    return this.id === other.value;
  }

  toString(): string {
    return this.id;
  }
}
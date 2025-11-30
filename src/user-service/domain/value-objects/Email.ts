// Value Object: Email
// Representa um email válido
// Imutável e auto-validado

export class Email {
  private constructor(private readonly value: string) {
    this.validate();
  }

  // Factory method para criar um Email
  static create(email: string): Email {
    return new Email(email);
  }

  // Valida o formato do email
  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error("Email cannot be empty");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error("Invalid email format");
    }

    if (this.value.length > 255) {
      throw new Error("Email cannot exceed 255 characters");
    }
  }

  // Retorna o valor do email como string
  getValue(): string {
    return this.value;
  }

  // Compara dois emails
  equals(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  // Converte para string
  toString(): string {
    return this.value;
  }
}

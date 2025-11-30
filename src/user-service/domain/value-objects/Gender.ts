// Value Object: Gender
// Representa um gênero válido
// Imutável e auto-validado

export class Gender {
  private constructor(public readonly value: string) {
    this.validate();
  }

  // Factory method para criar um Gender
  static create(gender: string): Gender {
    return new Gender(gender);
  }

  // Valida o gênero
  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error("Gender cannot be empty");
    }

    if (this.value.length > 50) {
      throw new Error("Gender cannot exceed 50 characters");
    }

    // Aceita qualquer string, mas pode validar contra lista se necessário
    // if (!Gender.VALID_GENDERS.includes(this.value.toLowerCase())) {
    //   throw new Error(`Gender must be one of: ${Gender.VALID_GENDERS.join(", ")}`);
    // }
  }

  // Compara dois gêneros
  equals(other: Gender): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  // Converte para string
  toString(): string {
    return this.value;
  }
}

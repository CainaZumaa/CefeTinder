// Value Object: Age
// Representa uma idade válida
// Imutável e auto-validado

export class Age {
  private constructor(public readonly value: number) {
    this.validate();
  }

  // Factory method para criar uma Age
  static create(age: number): Age {
    return new Age(age);
  }

  // Valida a idade
  private validate(): void {
    if (this.value < 18) {
      throw new Error("Age must be at least 18");
    }

    if (this.value > 110) {
      throw new Error("Age cannot exceed 110");
    }

    if (!Number.isInteger(this.value)) {
      throw new Error("Age must be an integer");
    }
  }

  // Compara duas idades
  equals(other: Age): boolean {
    return this.value === other.value;
  }

  // Verifica se é maior que outra idade
  isGreaterThan(other: Age): boolean {
    return this.value > other.value;
  }

  // Verifica se é menor que outra idade
  isLessThan(other: Age): boolean {
    return this.value < other.value;
  }

  // Converte para número
  toNumber(): number {
    return this.value;
  }
}

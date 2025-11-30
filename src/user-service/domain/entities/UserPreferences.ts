import { Age } from "../value-objects/Age";
import { Gender } from "../value-objects/Gender";

// Entidade de Domínio: UserPreferences
// Representa as preferências de busca de um usuário

export class UserPreferences {
  private constructor(
    public readonly userId: string,
    public readonly minAge: Age,
    public readonly maxAge: Age,
    public readonly genderPreference?: Gender,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  // Factory method para criar preferências padrão
  static createDefault(userId: string): UserPreferences {
    return new UserPreferences(
      userId,
      Age.create(18),
      Age.create(100),
      undefined,
      new Date(),
      new Date()
    );
  }

  // Factory method para criar preferências customizadas
  static create(
    userId: string,
    minAge: number,
    maxAge: number,
    genderPreference?: string
  ): UserPreferences {
    return new UserPreferences(
      userId,
      Age.create(minAge),
      Age.create(maxAge),
      genderPreference ? Gender.create(genderPreference) : undefined,
      new Date(),
      new Date()
    );
  }

  // Factory method para reconstruir a partir de dados persistidos
  static reconstitute(
    userId: string,
    minAge: number,
    maxAge: number,
    genderPreference: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ): UserPreferences {
    return new UserPreferences(
      userId,
      Age.create(minAge),
      Age.create(maxAge),
      genderPreference ? Gender.create(genderPreference) : undefined,
      createdAt,
      updatedAt
    );
  }

  // Valida invariantes
  private validate(): void {
    if (this.minAge.value > this.maxAge.value) {
      throw new Error("Minimum age cannot be greater than maximum age");
    }
  }

  // Atualiza as preferências
  update(
    minAge?: number,
    maxAge?: number,
    genderPreference?: string
  ): UserPreferences {
    return new UserPreferences(
      this.userId,
      minAge !== undefined ? Age.create(minAge) : this.minAge,
      maxAge !== undefined ? Age.create(maxAge) : this.maxAge,
      genderPreference !== undefined
        ? Gender.create(genderPreference)
        : this.genderPreference,
      this.createdAt,
      new Date()
    );
  }

  // Verifica se um usuário atende às preferências
  matches(age: number, gender: string): boolean {
    const ageMatches = age >= this.minAge.value && age <= this.maxAge.value;
    const genderMatches =
      !this.genderPreference || this.genderPreference.value === gender;

    return ageMatches && genderMatches;
  }
}

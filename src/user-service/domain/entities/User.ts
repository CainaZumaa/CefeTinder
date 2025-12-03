import { Email } from "../value-objects/Email";
import { Age } from "../value-objects/Age";
import { Gender } from "../value-objects/Gender";

// Entidade de Domínio: User
// Representa um usuário no contexto do domínio
// Contém lógica de negócio e invariantes

export class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: Email,
    public readonly age: Age,
    public readonly gender: Gender,
    public readonly bio?: string,
    public readonly lastSuperLike?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  // Factory method para criar um novo usuário
  static create(
    name: string,
    email: string,
    age: number,
    gender: string,
    bio?: string,
    id?: string
  ): User {
    // Gera UUID se não fornecido
    const userId = id || this.generateUUID();

    return new User(
      userId,
      name,
      Email.create(email),
      Age.create(age),
      Gender.create(gender),
      bio,
      undefined,
      new Date(),
      new Date()
    );
  }

  // Gera um UUID v4
  private static generateUUID(): string {
    // Usa crypto.randomUUID() se disponível (Node 14.17+)
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }

    // Fallback para geração manual
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Factory method para reconstruir usuário a partir de dados persistidos
  static reconstitute(
    id: string,
    name: string,
    email: string,
    age: number,
    gender: string,
    bio: string | undefined,
    lastSuperLike: Date | undefined,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(
      id,
      name,
      Email.create(email),
      Age.create(age),
      Gender.create(gender),
      bio,
      lastSuperLike,
      createdAt,
      updatedAt
    );
  }

  // Valida invariantes da entidade
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }

    if (this.name.length > 255) {
      throw new Error("User name cannot exceed 255 characters");
    }

    if (this.bio && this.bio.length > 1000) {
      throw new Error("Bio cannot exceed 1000 characters");
    }
  }

  // Atualiza a bio do usuário
  updateBio(bio: string): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.age,
      this.gender,
      bio,
      this.lastSuperLike,
      this.createdAt,
      new Date()
    );
  }

  // Registra o último super like
  recordSuperLike(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.age,
      this.gender,
      this.bio,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  // Verifica se pode enviar super like (cooldown de 24 horas)
  canSendSuperLike(): boolean {
    if (!this.lastSuperLike) {
      return true;
    }

    const now = new Date();
    const diffInHours =
      (now.getTime() - this.lastSuperLike.getTime()) / (1000 * 60 * 60);
    return diffInHours >= 24;
  }
}

import { User } from "../entities/User";
import { UserPreferences } from "../entities/UserPreferences";

// Interface do Repositório de Usuários (Domain Layer)
// Define o contrato para persistência de usuários
// Segue o padrão Repository do DDD

export interface IUserRepository {
  // Salva um novo usuário
  save(user: User): Promise<void>;

  // Busca um usuário por ID
  findById(id: string): Promise<User | null>;

  // Busca um usuário por email
  findByEmail(email: string): Promise<User | null>;

  // Verifica se um email já existe
  existsByEmail(email: string): Promise<boolean>;

  // Remove um usuário
  delete(id: string): Promise<void>;
}

// Interface do Repositório de Preferências (Domain Layer)
export interface IUserPreferencesRepository {
  // Salva ou atualiza preferências
  save(preferences: UserPreferences): Promise<void>;

  // Busca preferências por userId
  findByUserId(userId: string): Promise<UserPreferences | null>;

  // Remove preferências
  delete(userId: string): Promise<void>;
}

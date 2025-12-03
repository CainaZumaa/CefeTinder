import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserPreferencesRepository } from "../../domain/repositories/IUserRepository";
import { UserNotFoundException } from "../../domain/exceptions/UserNotFoundException";
import { PostgresUserRepositoryExtended } from "../../infrastructure/persistence/PostgresUserRepositoryExtended";

/**
 * Use Case: Buscar Matches Potenciais
 * Camada de Application
 *
 * Nota: Este use case precisa acessar dados de matches,
 * que estão no mesmo banco. Em uma arquitetura de microserviços completa,
 * isso seria feito via comunicação entre serviços.
 */
export class GetPotentialMatchesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly preferencesRepository: IUserPreferencesRepository
  ) {}

  async execute(userId: string): Promise<User[]> {
    // Verifica se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Busca preferências do usuário
    const preferences = await this.preferencesRepository.findByUserId(userId);
    if (!preferences) {
      // Se não tem preferências, retorna lista vazia
      return [];
    }

    // Se o repositório for estendido, usa o método otimizado
    if (this.userRepository instanceof PostgresUserRepositoryExtended) {
      return this.userRepository.findPotentialMatches(userId);
    }

    // Fallback: retorna lista vazia se não houver método otimizado
    return [];
  }
}

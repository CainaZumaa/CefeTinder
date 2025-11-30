import { UserPreferences } from "../../domain/entities/UserPreferences";
import { IUserPreferencesRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserNotFoundException } from "../../domain/exceptions/UserNotFoundException";

// DTO para atualização de preferências
export interface UpdateUserPreferencesDTO {
  userId: string;
  minAge?: number;
  maxAge?: number;
  genderPreference?: string;
}

// Use Case: Atualizar Preferências do Usuário
//Camada de Application

export class UpdateUserPreferencesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly preferencesRepository: IUserPreferencesRepository
  ) {}

  async execute(dto: UpdateUserPreferencesDTO): Promise<void> {
    // Verifica se o usuário existe
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundException(dto.userId);
    }

    // Busca preferências existentes ou cria novas
    let preferences = await this.preferencesRepository.findByUserId(dto.userId);

    if (!preferences) {
      // Cria preferências padrão se não existirem
      preferences = UserPreferences.createDefault(dto.userId);
    }

    // Atualiza as preferências
    const updatedPreferences = preferences.update(
      dto.minAge,
      dto.maxAge,
      dto.genderPreference
    );

    // Persiste
    await this.preferencesRepository.save(updatedPreferences);
  }
}

import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { EmailAlreadyExistsException } from "../../domain/exceptions/EmailAlreadyExistsException";
import { CreateUserDTO } from "../dtos/CreateUserDTO";

// Use Case: Criar Usuário
// Orquestra a criação de um novo usuário
// Camada de Application

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDTO): Promise<User> {
    // Verifica se o email já existe
    const emailExists = await this.userRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new EmailAlreadyExistsException(dto.email);
    }

    // Cria a entidade de domínio
    const user = User.create(dto.name, dto.email, dto.age, dto.gender, dto.bio);

    // Persiste o usuário
    await this.userRepository.save(user);

    return user;
  }
}

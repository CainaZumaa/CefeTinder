import { User } from "../../domain/entities/User";
import { UserDTO } from "../dtos/UserDTO";

// Mapper entre entidades de domínio e DTOs
//Camada de Application

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      age: user.age.value,
      gender: user.gender.value,
      bio: user.bio,
      lastSuperLike: user.lastSuperLike,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDTOList(users: User[]): UserDTO[] {
    return users.map((user) => this.toDTO(user));
  }
}

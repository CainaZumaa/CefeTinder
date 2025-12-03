import { User } from "../../../domain/entities/User";
import { UserDTO } from "../../../application/dtos/UserDTO";
import { UserMapper } from "../../../application/mappers/UserMapper";
import {
  User as ProtoUser,
  PotentialMatches,
} from "../../../../grpc/proto/user_pb";

//Mapper entre DTOs/Entidades e objetos gRPC
// Camada de Presentation

export class UserGrpcMapper {
  // Converte entidade de domínio para proto User
  static toProto(user: User): ProtoUser {
    const dto = UserMapper.toDTO(user);
    return this.dtoToProto(dto);
  }

  // Converte DTO para proto User
  static dtoToProto(dto: UserDTO): ProtoUser {
    const protoUser = new ProtoUser();
    protoUser.setId(dto.id);
    protoUser.setName(dto.name);
    protoUser.setAge(dto.age);
    protoUser.setGender(dto.gender);
    if (dto.bio) {
      protoUser.setBio(dto.bio);
    }
    return protoUser;
  }

  // Converte lista de usuários para PotentialMatches
  static toPotentialMatches(users: User[]): PotentialMatches {
    const protoMatches = new PotentialMatches();
    const protoUsers = users.map((user) => this.toProto(user));
    protoMatches.setUsersList(protoUsers);
    return protoMatches;
  }
}

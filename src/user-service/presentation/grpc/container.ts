import { Container } from "inversify";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserPreferencesRepository } from "../../domain/repositories/IUserRepository";
import { PostgresUserRepositoryExtended } from "../../infrastructure/persistence/PostgresUserRepositoryExtended";
import { PostgresUserPreferencesRepository } from "../../infrastructure/persistence/PostgresUserPreferencesRepository";
import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { GetUserByIdUseCase } from "../../application/use-cases/GetUserByIdUseCase";
import { UpdateUserPreferencesUseCase } from "../../application/use-cases/UpdateUserPreferencesUseCase";
import { GetPotentialMatchesUseCase } from "../../application/use-cases/GetPotentialMatchesUseCase";
import { UserGrpcController } from "./UserGrpcController";

//Container de injeção de dependências
//Configura todas as dependências seguindo Clean Architecture

const container = new Container();

// Repositórios (Infrastructure)
const userRepository = new PostgresUserRepositoryExtended();
const preferencesRepository = new PostgresUserPreferencesRepository();

container
  .bind<IUserRepository>("IUserRepository")
  .toConstantValue(userRepository);

container
  .bind<IUserPreferencesRepository>("IUserPreferencesRepository")
  .toConstantValue(preferencesRepository);

// Use Cases (Application)
const createUserUseCase = new CreateUserUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const updateUserPreferencesUseCase = new UpdateUserPreferencesUseCase(
  userRepository,
  preferencesRepository
);
const getPotentialMatchesUseCase = new GetPotentialMatchesUseCase(
  userRepository,
  preferencesRepository
);

container
  .bind<CreateUserUseCase>("CreateUserUseCase")
  .toConstantValue(createUserUseCase);

container
  .bind<GetUserByIdUseCase>("GetUserByIdUseCase")
  .toConstantValue(getUserByIdUseCase);

container
  .bind<UpdateUserPreferencesUseCase>("UpdateUserPreferencesUseCase")
  .toConstantValue(updateUserPreferencesUseCase);

container
  .bind<GetPotentialMatchesUseCase>("GetPotentialMatchesUseCase")
  .toConstantValue(getPotentialMatchesUseCase);

// Controller (Presentation)
const controller = new UserGrpcController(
  createUserUseCase,
  getUserByIdUseCase,
  updateUserPreferencesUseCase,
  getPotentialMatchesUseCase
);

container
  .bind<UserGrpcController>("UserGrpcController")
  .toConstantValue(controller);

export { container };

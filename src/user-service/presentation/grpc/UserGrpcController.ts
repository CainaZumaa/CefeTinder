import * as grpc from "@grpc/grpc-js";
import { IUserServiceServer } from "../../../grpc/proto/user_grpc_pb";
import { User, PotentialMatches } from "../../../grpc/proto/user_pb";
import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { GetUserByIdUseCase } from "../../application/use-cases/GetUserByIdUseCase";
import { UpdateUserPreferencesUseCase } from "../../application/use-cases/UpdateUserPreferencesUseCase";
import { GetPotentialMatchesUseCase } from "../../application/use-cases/GetPotentialMatchesUseCase";
import { UserGrpcMapper } from "./mappers/UserGrpcMapper";

/**
 * Controller gRPC para UserService
 * Camada de Presentation
 *
 * Responsável:
 * - Receber requisições gRPC
 * - Converter para DTOs/Use Cases
 * - Converter respostas para proto
 * - Tratar erros e retornar códigos gRPC apropriados
 */
export class UserGrpcController implements IUserServiceServer {
  [key: string]: any;

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserPreferencesUseCase: UpdateUserPreferencesUseCase,
    private readonly getPotentialMatchesUseCase: GetPotentialMatchesUseCase
  ) {}

  async getUser(
    call: grpc.ServerUnaryCall<any, User>,
    callback: grpc.sendUnaryData<User>
  ): Promise<void> {
    try {
      const userId = call.request.getUserid();
      console.log("Received GetUser request for userId:", userId);

      const user = await this.getUserByIdUseCase.execute(userId);
      const protoUser = UserGrpcMapper.toProto(user);

      callback(null, protoUser);
    } catch (error) {
      console.error("Error in GetUser:", error);
      this.handleError(error, callback);
    }
  }

  async createUser(
    call: grpc.ServerUnaryCall<any, User>,
    callback: grpc.sendUnaryData<User>
  ): Promise<void> {
    try {
      const request = call.request;
      const user = await this.createUserUseCase.execute({
        name: request.getName(),
        email: request.getEmail(),
        age: request.getAge(),
        gender: request.getGender(),
        bio: request.getBio() || undefined,
      });

      const protoUser = UserGrpcMapper.toProto(user);
      callback(null, protoUser);
    } catch (error) {
      console.error("Error in CreateUser:", error);
      this.handleError(error, callback);
    }
  }

  async getPotentialMatches(
    call: grpc.ServerUnaryCall<any, PotentialMatches>,
    callback: grpc.sendUnaryData<PotentialMatches>
  ): Promise<void> {
    try {
      const userId = call.request.getUserid();
      const users = await this.getPotentialMatchesUseCase.execute(userId);
      const protoMatches = UserGrpcMapper.toPotentialMatches(users);

      callback(null, protoMatches);
    } catch (error) {
      console.error("Error in GetPotentialMatches:", error);
      this.handleError(error, callback);
    }
  }

  async updateUserPreferences(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const userId = call.request.getUserid();
      const preferences = call.request.getPreferences();

      if (!preferences) {
        callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Preferences are required",
        });
        return;
      }

      await this.updateUserPreferencesUseCase.execute({
        userId,
        minAge: preferences.getMinage(),
        maxAge: preferences.getMaxage(),
        genderPreference: preferences.getGenderpreference() || undefined,
      });

      const updatedUser = await this.getUserByIdUseCase.execute(userId);
      const protoUser = UserGrpcMapper.toProto(updatedUser);
      callback(null, protoUser);
    } catch (error) {
      console.error("Error in UpdateUserPreferences:", error);
      this.handleError(error, callback);
    }
  }

  /**
   * Trata erros e converte para códigos gRPC apropriados
   */
  private handleError(error: unknown, callback: grpc.sendUnaryData<any>): void {
    const message =
      error instanceof Error && error.message && error.message.trim().length > 0
        ? error.message
        : "Internal server error";

    if (error instanceof Error) {
      // Mapeia exceções de domínio para códigos gRPC
      if (error.name === "UserNotFoundException") {
        callback({
          code: grpc.status.NOT_FOUND,
          message,
        });
        return;
      }

      if (error.name === "EmailAlreadyExistsException") {
        callback({
          code: grpc.status.ALREADY_EXISTS,
          message,
        });
        return;
      }
    }

    // Erro genérico
    callback({
      code: grpc.status.INTERNAL,
      message,
    });
  }
}

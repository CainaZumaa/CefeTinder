import { Resolver, Query, Mutation, Arg, Int, ID } from "type-graphql";
import { User } from "../types/user.type";
import { UserServiceClient } from "../../grpc/user/user.client";
import { CreateUserInput } from "../types/create-user-input.type";

// to-do: Acho que vale usar Decorator pattern aqui para adicionar logging,
// validação e métricas aos resolvers sem modificar a lógica principal
@Resolver()
export class UserResolver {
  private userClient = new UserServiceClient();

  @Query(() => User, { nullable: true })
  async getUser(@Arg("id", () => ID) id: string): Promise<User | null> {
    try {
      const grpcUser = await this.userClient.GetUser(id);
      return {
        id: grpcUser.getId(),
        name: grpcUser.getName(),
        email: grpcUser.getEmail(),
        age: grpcUser.getAge(),
        gender: grpcUser.getGender(),
        created_at: new Date(), // Campo não presente, usar data atual
        updated_at: new Date(), // Campo não presente, usar data atual
      };
    } catch (error) {
      return null;
    }
  }

  @Query(() => [User])
  async getPotentialMatches(@Arg("userId") userId: string): Promise<User[]> {
    try {
      const grpcUsers = await this.userClient.GetPotentialMatches(userId);
      return grpcUsers.map(grpcUser => ({
        id: grpcUser.getId(),
        name: grpcUser.getName(),
        email: grpcUser.getEmail(), 
        age: grpcUser.getAge(),
        gender: grpcUser.getGender(),
        bio: grpcUser.getBio(), 
        created_at: new Date(), // Campo não presente
        updated_at: new Date(), // Campo não presente
      }));
    } catch (error) {
      return [];
    }
  }

  @Mutation(() => User)
  async createUser(@Arg("input") input: CreateUserInput): Promise<User> {
    const grpcUser = await this.userClient.CreateUser({
      name: input.name,
      age: input.age,
      email: input.email,
      gender: input.gender,
      bio: input.bio,
    });

    return {
      id: grpcUser.getId(),
      name: grpcUser.getName(),
      email: grpcUser.getEmail(),
      age: grpcUser.getAge(),
      gender: grpcUser.getGender(),
      created_at: new Date(), // Campo não presente, usar data atual
      updated_at: new Date(), // Campo não presente, usar data atual
    };
  }

  @Mutation(() => Boolean)
  async updateUserPreferences(
    @Arg("userId") userId: string,
    @Arg("minAge", () => Int, { nullable: true }) minAge?: number,
    @Arg("maxAge", () => Int, { nullable: true }) maxAge?: number,
    @Arg("genderPreference", { nullable: true }) genderPreference?: string
  ): Promise<boolean> {
    try {
      await this.userClient.UpdateUserPreferences(userId, {
        min_age: minAge!,
        max_age: maxAge!,
        gender_preference: genderPreference!,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";
import { User } from "../types/user.type";
import { UserServiceClient } from "../../grpc/user/user.client";
import { CreateUserInput } from "../types/create-user-input.type";
import { UserPreferencesInput } from "../types/user-preferences-input.type";

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
        bio: grpcUser.getBio(),
        created_at: new Date(), // Campo não presente, usar data atual
        updated_at: new Date(), // Campo não presente, usar data atual
      };
    } catch (error) {
      return null;
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
      bio: grpcUser.getBio(),
      age: grpcUser.getAge(),
      gender: grpcUser.getGender(),
      created_at: new Date(), // Campo não presente, usar data atual
      updated_at: new Date(), // Campo não presente, usar data atual
    };
  }

  @Query(() => [User])
  async getPotentialMatches(
    @Arg("userId", () => ID) userId: string
  ): Promise<User[]> {
    try {
      // This query automatically filters users based on the userId's stored preferences
      // The backend SQL handles filtering by: age range, gender preference, and excludes already matched users
      const grpcUsers = await this.userClient.GetPotentialMatches(userId);
      return grpcUsers.map((grpcUser) => ({
        id: grpcUser.getId(),
        name: grpcUser.getName(),
        email: grpcUser.getEmail(),
        age: grpcUser.getAge(),
        gender: grpcUser.getGender(),
        bio: grpcUser.getBio(),
        created_at: new Date(),
        updated_at: new Date(),
      }));
    } catch (error) {
      console.error("Error getting potential matches:", error);
      return [];
    }
  }

  @Mutation(() => Boolean)
  async updateUserPreferences(
    @Arg("userId", () => ID) userId: string,
    @Arg("preferences") preferences: UserPreferencesInput
  ): Promise<boolean> {
    try {
      await this.userClient.UpdateUserPreferences(userId, {
        min_age: preferences.min_age || 18,
        max_age: preferences.max_age || 100,
        gender_preference: preferences.preferred_gender,
      });
      return true;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return false;
    }
  }
}

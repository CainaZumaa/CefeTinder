import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { UserService } from "../../services/user/UserService";
import { User } from "../../types/graphql";

// to-do: Acho que vale usar Decorator pattern aqui para adicionar logging,
// validação e métricas aos resolvers sem modificar a lógica principal
@Resolver()
export class UserResolver {
  private userService = new UserService();

  @Query(() => User, { nullable: true })
  async getUser(@Arg("id") id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Query(() => [User])
  async getPotentialMatches(@Arg("userId") userId: string): Promise<User[]> {
    return this.userService.getPotentialMatches(userId);
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("age", () => Int) age: number,
    @Arg("gender") gender: string,
    @Arg("bio", { nullable: true }) bio?: string
  ): Promise<User> {
    return this.userService.createUser({
      name,
      email,
      age,
      gender,
      bio,
    });
  }

  @Mutation(() => Boolean)
  async updateUserPreferences(
    @Arg("userId") userId: string,
    @Arg("minAge", () => Int, { nullable: true }) minAge?: number,
    @Arg("maxAge", () => Int, { nullable: true }) maxAge?: number,
    @Arg("genderPreference", { nullable: true }) genderPreference?: string
  ): Promise<boolean> {
    await this.userService.updateUserPreferences(userId, {
      min_age: minAge,
      max_age: maxAge,
      gender_preference: genderPreference,
    });
    return true;
  }
}

import { IUserRepository } from "../../repositories/user/interface";
import { IUser, IUserPreferences, TYPES, User } from "../../types";
import { inject } from "inversify";

export class UserService {
  constructor(
    @inject(TYPES.IUserRepository) private repository: IUserRepository
  ) {}

  async createUser(userData: Partial<IUser>): Promise<User> {
    return this.repository.createUser(userData);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repository.getUserById(id);
  }
async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.getUserByEmail(email);
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<void> {
    return this.repository.updateUserPreferences(userId, preferences);
  }

  async getPotentialMatches(userId: string): Promise<User[]> {
    return this.repository.getPotentialMatches(userId);
  }
}

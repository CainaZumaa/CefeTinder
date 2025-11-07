import { IUser, IUserPreferences, User } from "../../types/index";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUserPreferences(userId: string, preferences: Partial<IUserPreferences>): Promise<void>;
  getPotentialMatches(userId: string): Promise<User[]>;
}
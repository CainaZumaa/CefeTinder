import { IUser, IUserPreferences, User } from "../../types/index";

export interface IUserRepository {
  getUserByEmail(email: string): User | PromiseLike<User | null> | null;
  createUser(userData: Partial<IUser>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUserPreferences(userId: string, preferences: Partial<IUserPreferences>): Promise<void>;
  getPotentialMatches(userId: string): Promise<User[]>;
}
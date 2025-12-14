import { IUser, IUserPreferences, User } from "../../types";
import { IUserRepository } from "./interface";

// Liskov Substitution: classe base com comportamento comum
export abstract class BaseUserRepository implements IUserRepository {
  // template method que pode ser usado por todas as implementações
  protected validateUserData(userData: Partial<IUser>): void {
    if (!userData.name || userData.name.trim().length === 0) {
      throw new Error("User name is required");
    }
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error("Valid email is required");
    }
    if (!userData.age || userData.age < 18 || userData.age > 100) {
      throw new Error("Age must be between 18 and 100");
    }
    if (!userData.gender || userData.gender.trim().length === 0) {
      throw new Error("Gender is required");
    }
  }

  protected validatePreferences(preferences: Partial<IUserPreferences>): void {
    if (preferences.min_age !== undefined && preferences.min_age < 18) {
      throw new Error("Minimum age must be at least 18");
    }
    if (preferences.max_age !== undefined && preferences.max_age > 100) {
      throw new Error("Maximum age must be at most 100");
    }
    if (
      preferences.min_age !== undefined &&
      preferences.max_age !== undefined &&
      preferences.min_age > preferences.max_age
    ) {
      throw new Error("Minimum age cannot be greater than maximum age");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // metodos abstratos que devem ser implementados pelas subclasses
  abstract getUserByEmail(
    email: string
  ): User | PromiseLike<User | null> | null;
  abstract createUser(userData: Partial<IUser>): Promise<User>;
  abstract getUserById(id: string): Promise<User | null>;
  abstract updateUserPreferences(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<void>;
  abstract getPotentialMatches(userId: string): Promise<User[]>;

  // método comum que funciona com qualquer implementação)
  async createUserWithValidation(userData: Partial<IUser>): Promise<User> {
    this.validateUserData(userData);
    return this.createUser(userData);
  }

  async updateUserPreferencesWithValidation(
    userId: string,
    preferences: Partial<IUserPreferences>
  ): Promise<void> {
    this.validatePreferences(preferences);
    return this.updateUserPreferences(userId, preferences);
  }
}

import { User } from "../../../domain/entities/User";
import { UserPreferences } from "../../../domain/entities/UserPreferences";

// Mapper entre entidades de domínio e dados persistidos
// Camada de Infrastructure

export class UserEntityMapper {
  // Converte dados do banco para entidade de domínio
  static toDomain(row: any): User {
    return User.reconstitute(
      row.id,
      row.name,
      row.email,
      row.age,
      row.gender,
      row.bio || undefined,
      row.last_super_like ? new Date(row.last_super_like) : undefined,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  // Converte entidade de domínio para dados do banco
  static toPersistence(user: User): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      age: user.age.value,
      gender: user.gender.value,
      bio: user.bio || null,
      last_super_like: user.lastSuperLike || null,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  // Converte dados do banco para UserPreferences
  static preferencesToDomain(row: any): UserPreferences {
    return UserPreferences.reconstitute(
      row.user_id,
      row.min_age,
      row.max_age,
      row.gender_preference || undefined,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  // Converte UserPreferences para dados do banco
  static preferencesToPersistence(preferences: UserPreferences): any {
    return {
      user_id: preferences.userId,
      min_age: preferences.minAge.value,
      max_age: preferences.maxAge.value,
      gender_preference: preferences.genderPreference?.value || null,
      created_at: preferences.createdAt,
      updated_at: preferences.updatedAt,
    };
  }
}

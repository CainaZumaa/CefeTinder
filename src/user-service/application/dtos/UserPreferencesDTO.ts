// DTO para preferências de usuário
// Camada de Application

export interface UserPreferencesDTO {
  userId: string;
  minAge: number;
  maxAge: number;
  genderPreference?: string;
  createdAt: Date;
  updatedAt: Date;
}

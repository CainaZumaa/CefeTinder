// DTO para representação de usuário
// Camada de Application

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bio?: string;
  lastSuperLike?: Date;
  createdAt: Date;
  updatedAt: Date;
}

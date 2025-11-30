//  DTO para criação de usuário
// Camada de Application - transfere dados entre camadas

export interface CreateUserDTO {
  name: string;
  email: string;
  age: number;
  gender: string;
  bio?: string;
}

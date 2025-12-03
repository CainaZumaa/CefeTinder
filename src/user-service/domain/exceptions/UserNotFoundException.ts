// Exceção de Domínio: UserNotFoundException
// Lançada quando um usuário não é encontrado
export class UserNotFoundException extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} not found`);
    this.name = "UserNotFoundException";
  }
}

// Exceção de Domínio: EmailAlreadyExistsException
// Lançada quando tenta criar um usuário com email já existente
export class EmailAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Email ${email} is already registered`);
    this.name = "EmailAlreadyExistsException";
  }
}

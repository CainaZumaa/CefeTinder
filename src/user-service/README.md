# User Service - DDD & Clean Architecture

Este é o microserviço de Usuários refatorado utilizando **Domain-Driven Design (DDD)** e **Clean Architecture**.

## 📁 Estrutura

```
src/user-service/
├── domain/                    # Camada de Domínio (Core)
│   ├── entities/              # Entidades de negócio
│   │   ├── User.ts
│   │   └── UserPreferences.ts
│   ├── value-objects/         # Objetos de valor
│   │   ├── Email.ts
│   │   ├── Age.ts
│   │   └── Gender.ts
│   ├── repositories/           # Interfaces de repositórios
│   │   └── IUserRepository.ts
│   └── exceptions/            # Exceções de domínio
│       ├── UserNotFoundException.ts
│       └── EmailAlreadyExistsException.ts
│
├── application/                # Camada de Aplicação
│   ├── use-cases/             # Casos de uso
│   │   ├── CreateUserUseCase.ts
│   │   ├── GetUserByIdUseCase.ts
│   │   ├── UpdateUserPreferencesUseCase.ts
│   │   └── GetPotentialMatchesUseCase.ts
│   ├── dtos/                   # Data Transfer Objects
│   │   ├── CreateUserDTO.ts
│   │   ├── UserDTO.ts
│   │   └── UserPreferencesDTO.ts
│   └── mappers/                # Mappers Application
│       └── UserMapper.ts
│
├── infrastructure/             # Camada de Infraestrutura
│   ├── database/               # Configuração de banco
│   │   └── DatabaseConnection.ts
│   └── persistence/            # Implementações de repositórios
│       ├── PostgresUserRepository.ts
│       ├── PostgresUserPreferencesRepository.ts
│       ├── PostgresUserRepositoryExtended.ts
│       └── mappers/
│           └── UserEntityMapper.ts
│
└── presentation/               # Camada de Apresentação
    └── grpc/                   # Controllers gRPC
        ├── UserGrpcController.ts
        ├── server.ts
        ├── container.ts
        └── mappers/
            └── UserGrpcMapper.ts
```

## 🏗️ Princípios Aplicados

### Clean Architecture

- **Dependências apontam para dentro**: Domain não depende de nada, Application depende apenas de Domain, Infrastructure e Presentation dependem de Application e Domain
- **Separação de responsabilidades**: Cada camada tem uma responsabilidade clara
- **Independência de frameworks**: Domain e Application não conhecem detalhes de implementação

### Domain-Driven Design

- **Entidades ricas**: `User` e `UserPreferences` contêm lógica de negócio
- **Value Objects**: `Email`, `Age`, `Gender` são imutáveis e auto-validados
- **Repositories**: Interfaces no domínio, implementações na infraestrutura
- **Use Cases**: Orquestram a lógica de aplicação

## 🔄 Fluxo de Dados

1. **Presentation** recebe requisição gRPC
2. **Controller** converte para DTO e chama **Use Case**
3. **Use Case** orquestra usando **Entities** e **Repositories**
4. **Repository** (Infrastructure) persiste no banco
5. Resposta volta pelas camadas convertida para proto

## 🗄️ Banco de Dados

O UserService possui seu próprio banco de dados (`users`), seguindo o princípio **Database per Service**.

**Schema**: Ver `infrastructure/database/schema.sql`

## 🚀 Como Usar

### Iniciar o serviço

```bash
npm run start:grpc:user-service
```

Ou usar o novo servidor DDD:

```bash
ts-node src/user-service/presentation/grpc/server.ts
```

### Configuração

Certifique-se de que o `.env` contém:

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/users
USER_SERVICE_ADDRESS=0.0.0.0:50051
```

**Documentação completa da refatoração**: Ver [REFACTORING.md](./REFACTORING.md)

## 📝 Notas

- O código antigo em `src/services/user/` e `src/repositories/user/` ainda existe para compatibilidade
- A nova estrutura está em `src/user-service/`
- Gradualmente, o código antigo pode ser migrado ou removido

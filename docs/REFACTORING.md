# Refatoração Parte 1: UserService para Microserviço com DDD e Clean Architecture

## 📋 Objetivo

Refatorar o UserService de uma arquitetura monolítica para um microserviço independente seguindo **Domain-Driven Design (DDD)** e **Clean Architecture**, garantindo total separação de responsabilidades e independência de banco de dados.

## 🎯 Princípios Aplicados

### Database per Service

- Cada microserviço possui seu próprio banco de dados
- UserService usa banco `users` (separado de `matches`)
- Elimina acoplamento entre serviços via banco compartilhado

### Clean Architecture

- **Camadas independentes**: Domain → Application → Infrastructure → Presentation
- **Dependências apontam para dentro**: Camadas externas dependem das internas
- **Domain isolado**: Não conhece detalhes de implementação (banco, gRPC, etc.)

### Domain-Driven Design

- **Entidades ricas**: Lógica de negócio nas entidades (`User`, `UserPreferences`)
- **Value Objects**: Objetos imutáveis e auto-validados (`Email`, `Age`, `Gender`)
- **Repositories**: Interfaces no domínio, implementações na infraestrutura
- **Use Cases**: Orquestram operações de negócio

## 🏗️ Arquitetura em Camadas

### 1. Domain (Núcleo)

**Responsabilidade**: Lógica de negócio pura, sem dependências externas

```
domain/
├── entities/           # Entidades de negócio
│   ├── User.ts         # Entidade User com métodos de negócio
│   └── UserPreferences.ts
├── value-objects/      # Objetos de valor imutáveis
│   ├── Email.ts        # Validação de email
│   ├── Age.ts          # Validação de idade
│   └── Gender.ts
├── repositories/       # Interfaces (contratos)
│   └── IUserRepository.ts
└── exceptions/         # Exceções de domínio
    ├── UserNotFoundException.ts
    └── EmailAlreadyExistsException.ts
```

**Características**:

- Não depende de frameworks ou bibliotecas externas
- Contém toda a lógica de negócio
- Define contratos (interfaces) para persistência

### 2. Application (Casos de Uso)

**Responsabilidade**: Orquestra operações de negócio

```
application/
├── use-cases/          # Casos de uso
│   ├── CreateUserUseCase.ts
│   ├── GetUserByIdUseCase.ts
│   ├── UpdateUserPreferencesUseCase.ts
│   └── GetPotentialMatchesUseCase.ts
├── dtos/               # Data Transfer Objects
│   ├── CreateUserDTO.ts
│   ├── UserDTO.ts
│   └── UserPreferencesDTO.ts
└── mappers/            # Conversão Domain ↔ DTO
    └── UserMapper.ts
```

**Características**:

- Depende apenas de Domain
- Orquestra entidades e repositórios
- Define DTOs para comunicação entre camadas

### 3. Infrastructure (Implementações)

**Responsabilidade**: Detalhes técnicos de persistência e conexões

```
infrastructure/
├── database/
│   └── DatabaseConnection.ts    # Pool de conexões PostgreSQL
└── persistence/
    ├── PostgresUserRepository.ts
    ├── PostgresUserPreferencesRepository.ts
    ├── PostgresUserRepositoryExtended.ts
    └── mappers/
        └── UserEntityMapper.ts   # Domain ↔ Persistência
```

**Características**:

- Implementa interfaces do Domain
- Conhece detalhes de PostgreSQL
- Converte entre entidades de domínio e dados do banco

### 4. Presentation (Interface)

**Responsabilidade**: Recebe requisições e formata respostas

```
presentation/
└── grpc/
    ├── UserGrpcController.ts    # Handler gRPC
    ├── server.ts                # Servidor gRPC
    ├── container.ts             # Injeção de dependências
    └── mappers/
        └── UserGrpcMapper.ts    # Domain ↔ Proto
```

**Características**:

- Depende de Application e Domain
- Converte entre protocolos (gRPC) e entidades
- Trata erros e retorna códigos apropriados

## 🔄 Fluxo de Execução

### Exemplo: Criar Usuário

```
1. gRPC Request → UserGrpcController.createUser()
   ↓
2. Controller → CreateUserUseCase.execute(dto)
   ↓
3. Use Case → UserRepository.existsByEmail() (verifica duplicidade)
   ↓
4. Use Case → User.create() (cria entidade de domínio)
   ↓
5. Use Case → UserRepository.save(user)
   ↓
6. Repository → PostgresUserRepository.save()
   ↓
7. Repository → UserEntityMapper.toPersistence() (converte)
   ↓
8. Repository → pool.query() (INSERT no banco)
   ↓
9. Resposta volta pelas camadas convertida para proto
```

## 📊 Comparação: Antes vs Depois

### Antes (Monolítico)

```
src/
├── services/user/UserService.ts        # Lógica misturada
├── repositories/user/
│   └── PostgresUserRepository.ts      # Acesso direto ao banco
└── grpc/user/user.implementation.ts   # Lógica de negócio no controller
```

**Problemas**:

- Lógica de negócio espalhada
- Dependências diretas de frameworks
- Difícil testar
- Acoplamento com banco compartilhado

### Depois (DDD + Clean Architecture)

```
src/user-service/
├── domain/          # Lógica de negócio isolada
├── application/     # Casos de uso orquestrados
├── infrastructure/  # Detalhes técnicos isolados
└── presentation/   # Interface isolada
```

**Benefícios**:

- Lógica de negócio centralizada no Domain
- Fácil testar (mocks nas interfaces)
- Independente de frameworks
- Banco próprio (Database per Service)

## 🗄️ Banco de Dados

### Schema do UserService

O UserService possui seu próprio banco (`users`) com apenas as tabelas necessárias:

- `users` - Dados dos usuários
- `interests` - Interesses disponíveis
- `users_interests` - Relação usuário-interesses
- `users_preferences` - Preferências de busca

**Não contém**: `matches` (irá pertencer ao MatchService)

## ✅ Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada camada tem uma função clara
2. **Testabilidade**: Domain e Application podem ser testados sem banco/gRPC
3. **Manutenibilidade**: Mudanças em uma camada não afetam outras
4. **Escalabilidade**: Cada serviço pode escalar independentemente
5. **Independência**: UserService não depende de outros serviços
6. **Database per Service**: Banco próprio garante isolamento

## 📝 Notas Importantes

- O código antigo (`src/services/user/`, `src/repositories/user/`) ainda existe para compatibilidade
- A nova estrutura está em `src/user-service/`
- Gradualmente, o código antigo pode ser removido após validação completa
- `GetPotentialMatchesUseCase` ainda acessa tabela `matches` (temporário - será comunicação entre serviços)

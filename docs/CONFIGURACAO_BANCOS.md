# Configuração de Bancos de Dados - Migração para Microserviços

## Situação Atual

Durante a migração gradual para microserviços, temos **2 bancos**:

### 1. Banco Original (`cefeTinder`)

**Usado por**: Serviços antigos (não refatorados)

- MatchService
- GraphQL Service
- Notification Service
- UserService antigo (se ainda estiver rodando)

**Tabelas**: `users`, `matches`, `interests`, `users_interests`, `users_preferences`

### 2. Banco UserService (`cefeTinder_User`)

**Usado por**: Novo UserService com DDD e Clean Architecture

- UserService DDD (`src/user-service/`)

**Tabelas**: `users`, `interests`, `users_interests`, `users_preferences` (sem `matches`)

## 🔧 Configuração do `.env`

```env
# Banco original - usado pelos serviços antigos
DATABASE_URL=postgresql://postgres:senha@localhost:5432/cefeTinder

# Banco do UserService DDD - usado apenas pelo novo UserService
USER_SERVICE_DATABASE_URL=postgresql://postgres:senha@localhost:5432/cefeTinder_User

# Configurações de serviços
USER_SERVICE_ADDRESS=0.0.0.0:50051
```

## 🎯 Como Funciona

### Serviços Antigos

- Usam `src/config/database.ts` → lê `DATABASE_URL` → banco `cefeTinder`

### UserService DDD

- Usa `src/user-service/infrastructure/database/DatabaseConnection.ts` → lê `USER_SERVICE_DATABASE_URL` → banco `cefeTinder_User`

## 📊 Evolução Futura

Quando todos os serviços forem refatorados, teremos **4 bancos**:

1. `cefeTinder_User` - UserService
2. `cefeTinder_Match` - MatchService
3. `cefeTinder_Notification` - NotificationService (se necessário)
4. `cefeTinder_GraphQL` - GraphQL Service (se necessário, ou apenas orquestra)

Cada serviço terá sua própria variável:

- `USER_SERVICE_DATABASE_URL`
- `MATCH_SERVICE_DATABASE_URL`
- `NOTIFICATION_SERVICE_DATABASE_URL`
- etc.

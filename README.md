# CEFETinder ❤️

<img width="500" height="106" alt="CEFETinder (1)" src="https://github.com/user-attachments/assets/c634f3f1-9bb1-42d4-a8bb-0401de5fab6f" />

Um aplicativo de encontros para estudantes do CEFET, desenvolvido com arquitetura de microsserviços.

## Arquitetura

O projeto utiliza uma arquitetura de microsserviços com os seguintes componentes:

![Diagrama de Arquitetura](./CEFET_TINDER.drawio.png)

- **Kong API Gateway**: Roteamento e gerenciamento de APIs
- **GraphQL**: API GraphQL para o frontend e gerenciamento de rotas
- **User Service**: Gerenciamento de usuários e preferências (gRPC)
- **Match Service**: Sistema de matching e likes (gRPC)
- **Notification Service**: Sistema de notificações em tempo real (WebSocket)

### Estrutura do projeto

- `src/services/user`: Serviço de gerenciamento de usuários
- `src/services/match`: Serviço de sistema de matching
- `src/services/notification`: Serviço de notificações em tempo real

#### GraphQL

Utilizamos o TypeGraphQL para definir o esquema GraphQL e os resolvers.

Os schemas estão definidos em `src/graphql/types` e os resolvers em `src/graphql/resolvers`.

O schema principal é montado dinamicamente em `src/graphql/schema.ts`, utilizando o TypeGraphQL.

#### gRPC

Os serviços de User e Match se comunicam via gRPC.

O projeto utiliza typescript, dessa forma, é possível gerar os tipos automaticamente a partir dos arquivos .proto.

Basta rodar o comando:

```bash
npm run generate:proto
```

Os arquivos gerados ficarão na pasta `src/proto`.

## Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- Docker e Docker Compose

## Executando o projeto com Docker Compose

Instale as dependências e inicie os serviços com Docker Compose:

```bash
docker-compose up --build -d
```

## Funcionamento do API Gateway (Kong)

O Kong API Gateway gerencia o roteamento das requisições para os serviços apropriados. Ele expõe as seguintes rotas:

- `/graphql`: Rota para o serviço GraphQL
- `/notifications`: Rota para o serviço de notificações

Os únicos serviços expostos externamente são o GraphQL e o Notification Service. Os serviços de User e Match são acessados internamente via gRPC.

## WebSocket para Notificações em Tempo Real

O Notification Service utiliza WebSocket para enviar notificações em tempo real aos usuários sobre novos matches e mensagens. O serviço escuta conexões WebSocket na rota `/notifications`.

O frontend pode se conectar ao WebSocket da seguinte forma:

```javascript
const socket = new WebSocket("ws://<KONG_API_GATEWAY_URL>/notifications");
socket.onmessage = function (event) {
  const notification = JSON.parse(event.data);
  console.log("Nova notificação:", notification);
};
```

## Padrões de Projeto (Design Patterns)

O projeto implementa diversos padrões de projeto para garantir código limpo, manutenível e escalável:

### 1. **Observer Pattern** 🔔

**Localização:** `src/patterns/observer/`, `src/services/match/MatchService.ts`

**Objetivo:** Implementar um sistema de notificações desacoplado onde múltiplos observadores podem reagir a eventos de match sem acoplamento direto.

**Como funciona:**

- `MatchService` atua como **Subject** que publica eventos (like, super like, match, dislike)
- `NotificationObserver` é um **Observer concreto** que escuta eventos e envia notificações via WebSocket
- Quando um match ocorre, todos os observadores registrados são notificados automaticamente

**Benefícios:**

- Desacoplamento entre lógica de negócio e notificações
- Facilita adição de novos tipos de observadores (analytics, email, push notifications)
- Testabilidade melhorada com mock observers

**Exemplo de uso:**

```typescript
const notificationObserver = new NotificationObserver(notificationService);
matchService.getSubject().attach(notificationObserver);
```

---

### 2. **Repository Pattern** 🗄️

**Localização:** `src/repositories/user/`

**Objetivo:** Abstrair a lógica de acesso a dados, permitindo trocar a implementação do banco de dados sem impactar a camada de negócio.

**Como funciona:**

- `IUserRepository` define o contrato de interface
- `PostgresUserRepository` e `SupabaseUserRepository` são implementações concretas
- `UserService` depende apenas da interface, não da implementação

**Benefícios:**

- Inversão de Dependência (SOLID - D)
- Facilita testes unitários com repositórios mock
- Permite trocar banco de dados sem alterar regras de negócio
- Substituição de Liskov (SOLID - L): qualquer implementação pode substituir a base

**Exemplo de uso:**

```typescript
// UserService usa a interface, não a implementação concreta
constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository)
```

---

### 3. **Factory Pattern** 🏭

**Localização:** `src/factories/DatabaseFactory.ts`

**Objetivo:** Centralizar a criação de objetos complexos (repositórios) e permitir diferentes implementações baseadas em configuração.

**Como funciona:**

- `DatabaseClientFactory.createUserRepository()` cria instâncias de repositórios
- Seleciona entre Postgres ou Supabase baseado em parâmetro
- Encapsula lógica de criação e inicialização

**Benefícios:**

- Centraliza lógica de criação
- Facilita adição de novos tipos de banco de dados
- Segue Open/Closed Principle (SOLID - O)

**Exemplo de uso:**

```typescript
const repository = DatabaseClientFactory.createUserRepository("postgres");
```

---

### 4. **Dependency Injection (DI)** 💉

**Localização:** `src/grpc/user/user.container.ts`, `src/services/user/UserService.ts`

**Objetivo:** Inverter o controle de dependências, permitindo que objetos recebam suas dependências ao invés de criá-las.

**Como funciona:**

- Usa biblioteca `inversify` para container IoC
- Registra dependências no container
- Injeta automaticamente no construtor usando decorators `@inject`

**Benefícios:**

- Inversão de Dependência (SOLID - D)
- Facilita testes com dependências mockadas
- Reduz acoplamento entre módulos
- Gerenciamento centralizado de dependências

**Exemplo de uso:**

```typescript
container.bind(TYPES.IUserRepository).toDynamicValue(() => {
  return DatabaseClientFactory.createUserRepository("postgres");
});
```

---

### 5. **Strategy Pattern** 🎯

**Localização:** `src/services/notification/NotificationService.ts`

**Objetivo:** Permitir diferentes estratégias de tratamento de notificações sem modificar a classe principal.

**Como funciona:**

- `NotificationHandler` é a interface abstrata de estratégia
- `MatchNotificationHandler` e `LikeNotificationHandler` são estratégias concretas
- `NotificationService` usa handlers registrados dinamicamente

**Benefícios:**

- Open/Closed Principle (SOLID - O): aberto para extensão, fechado para modificação
- Facilita adição de novos tipos de notificação
- Cada handler tem responsabilidade única (SOLID - S)

**Exemplo de uso:**

```typescript
notificationService.registerHandler("MATCH", new MatchNotificationHandler());
notificationService.registerHandler("EMAIL", new EmailNotificationHandler());
```

---

### 6. **Singleton Pattern** 🔒

**Localização:** `src/services/notification/NotificationService.ts`, `src/config/supabase.ts`

**Objetivo:** Garantir uma única instância de recursos compartilhados (conexões, serviços).

**Como funciona:**

- `getNotificationService()` retorna sempre a mesma instância
- `getSupabaseClient()` mantém uma única conexão com Supabase
- Evita múltiplas conexões e garante estado consistente

**Benefícios:**

- Economia de recursos (memória, conexões)
- Estado global consistente
- Controle sobre instanciação

**Exemplo de uso:**

```typescript
const notificationService = getNotificationService();
// Sempre retorna a mesma instância
```

---

### 7. **Microservices Pattern** 🔄

**Localização:** Arquitetura geral do projeto

**Objetivo:** Dividir a aplicação em serviços independentes e especializados.

**Como funciona:**

- **User Service** (gRPC) - Gerenciamento de usuários
- **Match Service** (gRPC) - Sistema de matching
- **Notification Service** (WebSocket) - Notificações em tempo real
- **GraphQL Service** - API unificada para frontend
- **Kong API Gateway** - Roteamento e gerenciamento

**Benefícios:**

- Escalabilidade independente de cada serviço
- Deploy e manutenção isolados
- Tecnologias diferentes para problemas diferentes
- Tolerância a falhas

---

## Princípios SOLID Aplicados

✅ **S - Single Responsibility Principle**

- Cada serviço tem uma responsabilidade única
- Separação clara entre camadas (repository, service, resolver)

✅ **O - Open/Closed Principle**

- Strategy pattern permite extensão sem modificação
- Factory pattern facilita adição de novos tipos

✅ **L - Liskov Substitution Principle**

- Implementações de repositórios são intercambiáveis
- `PostgresUserRepository` pode substituir `BaseUserRepository`

✅ **I - Interface Segregation Principle**

- Interfaces específicas (`IUserRepository`, `IMatchObserver`)
- Clientes dependem apenas dos métodos que usam

✅ **D - Dependency Inversion Principle**

- Serviços dependem de abstrações, não de implementações concretas
- Dependency Injection via InversifyJS

## Tecnologias

- TypeScript
- GraphQL
- gRPC
- Supabase (PostgreSQL)
- WebSocket

## Funcionalidades

- Filtros por idade e gênero
- Sistema de likes e super likes
- Notificações em tempo real de matches
- Gerenciamento de sessões ativas
- Sistema de matchmaking

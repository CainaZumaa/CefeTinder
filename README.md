# CEFETinder

Um aplicativo de encontros para estudantes do CEFET, desenvolvido com arquitetura de microsserviços.

## Arquitetura

O projeto utiliza uma arquitetura de microsserviços com os seguintes componentes:

- **Gateway**: API GraphQL para o frontend e gerenciamento de rotas
- **User Service**: Gerenciamento de usuários e preferências (gRPC)
- **Match Service**: Sistema de matching e likes (gRPC)
- **Notification Service**: Sistema de notificações em tempo real (WebSocket)

### Design Patterns Utilizados

1. **Observer**

   - Implementado no sistema de notificações
   - Permite que usuários recebam atualizações em tempo real sobre matches

2. **Strategy**

   - Usado no sistema de matching
   - Permite diferentes algoritmos de matching baseados em critérios específicos

3. **Singleton**

   - Usado nas conexões com Supabase
   - Garante uma única instância de conexão com o banco de dados

### Design Patterns Sugeridos

- **Factory Method**: Para criação de diferentes tipos de serviços e conexões
- **Decorator**: Para adicionar logging, validação e métricas aos resolvers

## Tecnologias

- TypeScript
- GraphQL
- gRPC
- Supabase (PostgreSQL)
- WebSocket

## Configuração

1. Clone o repositório
2. Copie `env.example` para `.env` e configure as variáveis
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute o projeto:
   ```bash
   npm run dev
   ```

## Funcionalidades

- Filtros por idade, gênero e interesses
- Sistema de likes e super likes
- Notificações em tempo real de matches
- Gerenciamento de sessões ativas
- Sistema de matchmaking

## Estrutura do Projeto

```
src/
├── gateway/           # Gateway GraphQL
│   ├── resolvers/     # Resolvers GraphQL
│   └── server.ts      # Servidor principal
├── services/          # Microsserviços
│   ├── user/          # User Service
│   ├── match/         # Match Service
│   └── notification/  # Notification Service
├── config/            # Configurações
└── types/             # Tipos TypeScript
```

## Próximos Passos

- Implementar Kong API Gateway
- Configurar comunicação gRPC entre serviços
- Adicionar autenticação com Supabase Auth
- Implementar Docker e deploy

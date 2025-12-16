# Sistema de Chat - DDD + Clean Architecture

## Tecnologias
- Node.js 18+
- TypeScript
- PostgreSQL
- RabbitMQ
- Docker & Docker Compose

## Como executar

### Com Docker (Recomendado)
```bash
# Subir todos os serviços
npm run docker:up

# Parar serviços
npm run docker:down

# Ver logs
docker-compose logs -f

###Estrura
'''
chat-service/  
│ ├── domain/
│ │ ├── aggregates/
│ │ │ └── ConversationAggregate.ts
│ │ ├── entities/
│ │ │ ├── Message.ts
│ │ │ └── Conversation.ts
│ │ ├── value-objects/
│ │ │ ├── MessageId.ts
│ │ │ ├── Content.ts
│ │ │ ├── SenderId.ts
│ │ │ ├── ReceiverId.ts
│ │ │ ├── ChatRoomId.ts
│ │ │ └── Timestamp.ts
│ │ ├── services/
│ │ │ ├── MessageValidator.ts
│ │ │ └── ChatPolicy.ts
│ │ ├── repositories/
│ │ │ ├── IMessageRepository.ts
│ │ │ └── IConversationRepository.ts
│ │ ├── exceptions/
│ │ │ ├── ChatDomainException.ts
│ │ │ └── MessageValidationException.ts
│ │ └── events/
│ │   ├── DomainEvent.ts
│ │   ├── MessageSentEvent.ts
│ │   └── MessageReadEvent.ts
│ ├── application/
│ │ ├── use-cases/
│ │ │ ├── SendMessageUseCase.ts
│ │ │ ├── MarkAsReadUseCase.ts
│ │ │ ├── CreateConversationUseCase.ts
│ │ │ ├── UpdateMessageUseCase.ts
│ │ │ └── DeleteMessageUseCase.ts
│ │ ├── ports/
│ │ │ └── EventBus.ts
│ │ ├── dtos/
│ │ │ ├── MessageDTO.ts
│ │ │ └── ConversationDTO.ts
│ │ └── mappers/
│ │ │ └── MessageMapper.ts
│ │ ├── event-handlers/
│ │ │ ├── MessageSentHandler.ts
│ │ │ └── MessageReadHandler.ts
│ │ └── integration-events/
│ │   ├── MessageSentIntegrationEvent.ts
│ │   └── MessageReadIntegrationEvent.ts
│ ├── infrastructure/
│ │ ├── config/
│ │ ├── database/
│ │ │ ├── DatabaseConnection.ts
│ │ │ └── Schema.sql
│ │ ├── migration/
│ │ │ └── optimizations.sql
│ │ ├── seed/
│ │ │ └──
│ │ ├── messaging/
│ │ │   └── rabbitmq/
│ │ │       ├── RabbitMQConnection.ts
│ │ │       ├── RabbitMQEventBus.ts
│ │ │       ├── exchanges.ts
│ │ │       └── queues.ts
│ │ └── persistence/
│ │   ├── PostgresChatPreferencesRepository.ts
│ │   ├── PostgresChatRepositoryExtended.ts
│ │   └── mappers/
│ │      └── ChatEntityMapper.ts
│ └─ presentation/
│   └── WebSocket/
│     ├── ChatWebSocketController.ts
│     ├── server.ts
│     ├── container.ts
│     ├── setup.ts
│     └── mappers/
│       └── ChatWebSocketMapper.ts
├── .env
├── docker-compose.yml
├── package-lock.json
├── package.json
└── tsconfig.json

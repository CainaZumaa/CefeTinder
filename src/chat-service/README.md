Estrura

chat-service/  
│ ├── domain/ 
│ │ ├── entities/ 
│ │ │ └── Message.ts 
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
│ │ │ └── IMessageRepository.ts
│ │ └── exceptions/ 
│ │ ├── ChatDomainException.ts 
│ │ └── MessageValidationException.ts 
├── application/ 
│ ├── use-cases/ 
│ │ ├── SendMessageUseCase.ts 
│ │ ├── MarkAsReadUseCase.ts 
│ │ ├── DeleteMessageUseCase.ts 
│ │ └── UpdateMessageUseCase.ts 
│ ├── dtos/ 
│ │ └── MessageDTO.ts 
│ └── mappers/ 
│ └── MessageMapper.ts 
├── infrastructure/ 
│ ├── database/ 
│ │   └── DatabaseConnection.ts 
│ └── persistence/ 
│     ├── PostgresChatRepository.ts 
│     ├── PostgresChatPreferencesRepository.ts 
│     ├── PostgresChatRepositoryExtended.ts 
│     └── mappers/ 
│         └── ChatEntityMapper.ts 
└── presentation/ 
    └── WebSocket/ 
        ├── ChatWebSocketController.ts 
        ├── server.ts 
        ├── container.ts 
        └── mappers/ 
            └── ChatWebSocketMapper.ts
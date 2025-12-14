export * from "./domain/entities/Notification";
export * from "./domain/value-objects/UserId";
export * from "./domain/value-objects/NotificationType";

export * from "./application/ports/ConnectionRegistry";
export * from "./application/ports/NotificationSender";

export * from "./application/use-cases/RegisterConnectionUseCase";
export * from "./application/use-cases/UnregisterConnectionUseCase";
export * from "./application/use-cases/NotifyLikeUseCase";
export * from "./application/use-cases/NotifyMatchUseCase";

export * from "./infrastructure/websocket/InMemoryConnectionRegistry";
export * from "./infrastructure/websocket/WebSocketNotificationSender";

export * from "./presentation/http/notification.routes";
export * from "./presentation/websocket/setupWebSocketConnections";

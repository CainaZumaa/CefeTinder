import { MessageReadEvent } from "../../domain/events/MessageReadEvent";
import { EventBus } from "../ports/EventBus";
import { MessageReadIntegrationEvent } from "../integration-events/MessageReadIntegrationEvent";

export class MessageReadHandler {
    constructor(private readonly eventBus: EventBus) {}

    async handle(event: MessageReadEvent): Promise<void> {
        const integrationEvent = new MessageReadIntegrationEvent(
            event.messageId,
            event.readerId,
            event.readAt,
            event.aggregateId
        );

        await this.eventBus.publish(integrationEvent);
    }
}
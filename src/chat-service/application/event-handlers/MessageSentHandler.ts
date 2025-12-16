import { MessageSentEvent } from "../../domain/events/MessageSentEvent";
import { EventBus } from "../ports/EventBus";
import { MessageSentIntegrationEvent } from "../integration-events/MessageSentIntegrationEvent";

export class MessageSentHandler {
    constructor(private readonly eventBus: EventBus) {}

    async handle(event: MessageSentEvent): Promise<void> {
        const integrationEvent = new MessageSentIntegrationEvent(
            event.messageId,
            event.senderId,
            event.receiverId,
            event.chatRoomId,
            event.content
        );

        await this.eventBus.publish(integrationEvent);
    }
}
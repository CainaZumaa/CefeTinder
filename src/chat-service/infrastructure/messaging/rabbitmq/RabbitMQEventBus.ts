import { EventBus } from '../../../application/ports/EventBus';
import { RabbitMQConnection } from './RabbitMQConnection';
import { Exchanges } from './exchanges';
import { RoutingKeys } from './queues';

export class RabbitMQEventBus implements EventBus {
    private handlers: Map<string, Function[]> = new Map();

    constructor(private readonly rabbitMQ: RabbitMQConnection) {}

    async publish(event: any): Promise<void> {
        let exchange = Exchanges.CHAT_EVENTS;
        let routingKey = 'chat.event';

        const eventName = event.constructor?.name || event.eventName || '';
        
        if (eventName.includes('MessageSent') || event.messageId) {

            routingKey = RoutingKeys.MESSAGE_SENT;
        } else if (eventName.includes('MessageRead') || event.readerId) {

            routingKey = RoutingKeys.MESSAGE_READ;
        }

        await this.rabbitMQ.publish(exchange, routingKey, event);
    }

    async subscribe(eventName: string, handler: Function): Promise<void> {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
    }
}
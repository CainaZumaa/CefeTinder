import * as amqp from 'amqplib';
import { Exchanges, ExchangeTypes } from './exchanges';
import { Queues, RoutingKeys } from './queues';

export class RabbitMQConnection {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private connected: boolean = false;

    constructor(private readonly url: string) {}

    async connect(): Promise<void> {
        if (this.connected) return;

        await amqp.connect(this.url);
        this.channel = createChannel();

        await this.setupExchangesAndQueues();
        
        this.connected = true;
    }

    private async setupExchangesAndQueues(): Promise<void> {
        if (!this.channel) return;

        await this.channel.assertExchange(Exchanges.CHAT_EVENTS, ExchangeTypes.TOPIC, { durable: true });
        await this.channel.assertExchange(Exchanges.MESSAGE_EVENTS, ExchangeTypes.TOPIC, { durable: true });

        await this.channel.assertQueue(Queues.MESSAGE_SENT_QUEUE, { durable: true });
        await this.channel.assertQueue(Queues.MESSAGE_READ_QUEUE, { durable: true });
        await this.channel.assertQueue(Queues.NOTIFICATIONS_QUEUE, { durable: true });

        await this.channel.bindQueue(Queues.MESSAGE_SENT_QUEUE, Exchanges.MESSAGE_EVENTS, RoutingKeys.MESSAGE_SENT);
        await this.channel.bindQueue(Queues.MESSAGE_READ_QUEUE, Exchanges.MESSAGE_EVENTS, RoutingKeys.MESSAGE_READ);
        await this.channel.bindQueue(Queues.NOTIFICATIONS_QUEUE, Exchanges.CHAT_EVENTS, '#');
    }

    getChannel(): amqp.Channel {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not available');
        }
        return this.channel;
    }

    async publish(exchange: string, routingKey: string, message: any): Promise<boolean> {
        await this.connect();
        if (!this.channel) throw new Error('Channel not available');
        
        return this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
    }

    async consume(queue: string, onMessage: (message: any) => Promise<void>): Promise<void> {
        await this.connect();
        if (!this.channel) throw new Error('Channel not available');
        
        await this.channel.consume(queue, async (msg) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                await onMessage(content);
                this.channel!.ack(msg);
            }
        });
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }
        if (this.connection) {
            this.connection
            this.connection = null;
        }
        this.connected = false;
    }
}

function createChannel(): amqp.Channel | null {
    throw new Error('Function not implemented.');
}

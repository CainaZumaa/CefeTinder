import { ChannelModel, ConfirmChannel } from "amqplib";
import {
  assertTopicExchange,
  closeRabbitMQ,
  connectConfirmChannel,
  DEFAULT_EXCHANGE,
  publishJson,
} from "./rabbitmq";

export type MatchRoutingKey =
  | "match.like_sent"
  | "match.super_like_sent"
  | "match.match_created"
  | "match.dislike_sent";

export interface MatchEventsPublisher {
  publish(
    routingKey: MatchRoutingKey,
    message: Record<string, unknown>
  ): Promise<void>;
}

export class RabbitMQMatchEventsPublisher implements MatchEventsPublisher {
  private client?: ChannelModel;
  private channel?: ConfirmChannel;
  private initPromise?: Promise<void>;

  constructor(
    private readonly url: string,
    private readonly exchange: string = DEFAULT_EXCHANGE
  ) {}

  private async init(): Promise<void> {
    if (this.channel) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const { client, channel } = await connectConfirmChannel({
        url: this.url,
      });

      this.client = client;
      this.channel = channel;

      await assertTopicExchange(channel, this.exchange);

      client.on("error", (err) => {
        console.error("[RabbitMQ] connection error:", err);
      });

      client.on("close", () => {
        this.channel = undefined;
        this.client = undefined;
        this.initPromise = undefined;
        console.warn("[RabbitMQ] connection closed");
      });
    })();

    return this.initPromise;
  }

  async publish(
    routingKey: MatchRoutingKey,
    message: Record<string, unknown>
  ): Promise<void> {
    await this.init();

    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    await publishJson(this.channel, {
      exchange: this.exchange,
      routingKey,
      message,
    });
  }

  async close(): Promise<void> {
    await closeRabbitMQ(this.client, this.channel);
  }
}

import * as amqplib from "amqplib";
import type { ChannelModel, ConfirmChannel, Options } from "amqplib";

export const DEFAULT_EXCHANGE = "cefetinder.events";

export type JsonRecord = Record<string, unknown>;

export interface RabbitMQConnectOptions {
  url: string;
  prefetch?: number;
}

export async function connectConfirmChannel(
  opts: RabbitMQConnectOptions
): Promise<{ client: ChannelModel; channel: ConfirmChannel }> {
  const client = (await amqplib.connect(opts.url)) as unknown as ChannelModel;
  const channel = await client.createConfirmChannel();

  if (typeof opts.prefetch === "number") {
    await channel.prefetch(opts.prefetch);
  }

  return { client, channel };
}

export async function assertTopicExchange(
  channel: ConfirmChannel,
  exchange: string = DEFAULT_EXCHANGE
): Promise<void> {
  await channel.assertExchange(exchange, "topic", { durable: true });
}

export async function publishJson(
  channel: ConfirmChannel,
  params: {
    exchange?: string;
    routingKey: string;
    message: JsonRecord;
    options?: Options.Publish;
  }
): Promise<void> {
  const exchange = params.exchange ?? DEFAULT_EXCHANGE;
  const body = Buffer.from(JSON.stringify(params.message));

  channel.publish(exchange, params.routingKey, body, {
    contentType: "application/json",
    deliveryMode: 2, // persistent
    timestamp: Math.floor(Date.now() / 1000),
    ...params.options,
  });

  await channel.waitForConfirms();
}

export async function closeRabbitMQ(
  client?: ChannelModel,
  channel?: ConfirmChannel
): Promise<void> {
  try {
    await channel?.close();
  } finally {
    await client?.close();
  }
}

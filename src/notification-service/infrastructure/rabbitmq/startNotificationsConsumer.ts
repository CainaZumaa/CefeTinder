import { ConsumeMessage } from "amqplib";
import {
  assertTopicExchange,
  connectConfirmChannel,
  DEFAULT_EXCHANGE,
} from "../../../messaging/rabbitmq";
import { NotifyLikeUseCase } from "../../application/use-cases/NotifyLikeUseCase";
import { NotifyMatchUseCase } from "../../application/use-cases/NotifyMatchUseCase";

type AnyRecord = Record<string, any>;

function parseJsonMessage(msg: ConsumeMessage): AnyRecord {
  const raw = msg.content.toString("utf8");
  return JSON.parse(raw) as AnyRecord;
}

export async function startNotificationsConsumer(params: {
  rabbitUrl: string;
  notifyLike: NotifyLikeUseCase;
  notifyMatch: NotifyMatchUseCase;
  exchange?: string;
  queueName?: string;
}): Promise<void> {
  const exchange = params.exchange ?? DEFAULT_EXCHANGE;
  const queueName = params.queueName ?? "notification-service.queue";

  const { client, channel } = await connectConfirmChannel({
    url: params.rabbitUrl,
    prefetch: 20,
  });

  await assertTopicExchange(channel, exchange);

  await channel.assertQueue(queueName, {
    durable: true,
  });

  await channel.bindQueue(queueName, exchange, "match.like_sent");
  await channel.bindQueue(queueName, exchange, "match.super_like_sent");
  await channel.bindQueue(queueName, exchange, "match.match_created");

  await channel.consume(
    queueName,
    (msg) => {
      if (!msg) return;

      try {
        const payload = parseJsonMessage(msg);
        const routingKey = msg.fields.routingKey;

        console.log("[RabbitMQ] received", routingKey);

        if (
          routingKey === "match.like_sent" ||
          routingKey === "match.super_like_sent"
        ) {
          const fromUserId = String(payload.fromUserId ?? "");
          const toUserId = String(payload.toUserId ?? "");
          const isSuperLike = Boolean(payload.isSuperLike);

          if (!fromUserId || !toUserId) {
            throw new Error("Invalid like event payload");
          }

          params.notifyLike.execute({
            fromUserId,
            toUserId,
            isSuperLike,
          });
        } else if (routingKey === "match.match_created") {
          const matchId = String(payload.matchId ?? "");
          const user1Id = String(payload.user1Id ?? "");
          const user2Id = String(payload.user2Id ?? "");

          if (!matchId || !user1Id || !user2Id) {
            throw new Error("Invalid match event payload");
          }

          params.notifyMatch.execute({
            matchId,
            user1Id,
            user2Id,
            matchedAt: payload.matchedAt as any,
            isSuperLike: Boolean(payload.isSuperLike),
          });
        } else {
          // Ignore unknown routing keys but ack to avoid poison loops
          console.warn("[RabbitMQ] ignoring routingKey:", routingKey);
        }

        channel.ack(msg);
      } catch (err) {
        console.error("[RabbitMQ] failed to process message:", err);
        // Reject without requeue to avoid infinite loops on poison messages
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  client.on("close", () => {
    console.warn("[RabbitMQ] consumer connection closed");
  });

  client.on("error", (err: unknown) => {
    console.error("[RabbitMQ] consumer connection error:", err);
  });

  console.log(
    `[RabbitMQ] Notifications consumer started. exchange=${exchange} queue=${queueName}`
  );
}

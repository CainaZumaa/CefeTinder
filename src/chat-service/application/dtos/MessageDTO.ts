import { ChatRoomId } from "../../domain/value-objects/ChatRoomId";
import { Content } from "../../domain/value-objects/Content";
import { ReceiverId } from "../../domain/value-objects/ReceiverId";
import { SenderId } from "../../domain/value-objects/SenderId";

export interface MessageDTO {
  id: string;
  content: Content;
  senderId: SenderId;
  receiverId: ReceiverId;
  chatRoomId: ChatRoomId;
  sentAt: Date;
  readAt: Date | null;
  isRead: boolean;
}

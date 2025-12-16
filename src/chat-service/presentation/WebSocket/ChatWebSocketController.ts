import { Server, Socket } from 'socket.io';
import { ChatWebSocketMapper } from './mappers/ChatWebSocketMapper';
import { Container } from '../conteiner';

export class ChatWebSocketController {
    private sendMessageUseCase: any;
    private markAsReadUseCase: any;
    private createConversationUseCase: any;
    private updateMessageUseCase: any;
    private deleteMessageUseCase: any;

    constructor(private io: Server) {
        const container = Container.getInstance();
        this.sendMessageUseCase = container.get('SendMessageUseCase');
        this.markAsReadUseCase = container.get('MarkAsReadUseCase');
        this.createConversationUseCase = container.get('CreateConversationUseCase');
        this.updateMessageUseCase = container.get('UpdateMessageUseCase');
        this.deleteMessageUseCase = container.get('DeleteMessageUseCase');
    }

    initialize(socket: Socket): void {
        socket.on('join_conversation', (data: any) => this.joinConversation(socket, data));
        socket.on('send_message', (data: any) => this.sendMessage(socket, data));
        socket.on('mark_as_read', (data: any) => this.markAsRead(socket, data));
        socket.on('create_conversation', (data: any) => this.createConversation(socket, data));
        socket.on('update_message', (data: any) => this.updateMessage(socket, data));
        socket.on('delete_message', (data: any) => this.deleteMessage(socket, data));
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    private async joinConversation(socket: Socket, data: any): Promise<void> {
        try {
            const { conversationId, userId } = data;
            socket.join(`conversation_${conversationId}`);
            socket.data.userId = userId;
            
            this.io.to(`conversation_${conversationId}`).emit('user_joined', {
                userId,
                conversationId,
                timestamp: new Date().toISOString()
            });
            
            socket.emit('join_success', { conversationId });
        } catch (error) {
            socket.emit('error', ChatWebSocketMapper.toErrorResponse(error as Error));
        }
    }

    private async sendMessage(socket: Socket, data: any): Promise<void> {
        try {
            const { messageId, content, senderId, receiverId, chatRoomId } = data;
            
            const message = await this.sendMessageUseCase.execute(
                messageId,
                content,
                senderId,
                receiverId,
                chatRoomId
            );

            this.io.to(`conversation_${chatRoomId}`).emit('message_sent', {
                ...ChatWebSocketMapper.toMessageResponse(message),
                timestamp: new Date().toISOString()
            });

            socket.emit('message_sent_success', { messageId });
        } catch (error) {
            socket.emit('error', ChatWebSocketMapper.toErrorResponse(error as Error));
        }
    }

    private async markAsRead(socket: Socket, data: any): Promise<void> {
        try {
            const { messageId, readerId } = data;
            
            const message = await this.markAsReadUseCase.execute(messageId, readerId);

            this.io.to(`conversation_${message.chatRoomId}`).emit('message_read', {
                messageId,
                readerId,
                readAt: message.readAt,
                timestamp: new Date().toISOString()
            });

            socket.emit('mark_read_success', { messageId });
        } catch (error) {
            socket.emit('error', ChatWebSocketMapper.toErrorResponse(error as Error));
        }
    }

    private async createConversation(socket: Socket, data: any): Promise<void> {
        try {
            const { conversationId, participants } = data;
            
            await this.createConversationUseCase.execute(conversationId, participants);

            participants.forEach((participant: string) => {
                this.io.emit('conversation_created', {
                    conversationId,
                    participants,
                    timestamp: new Date().toISOString()
                });
            });

            socket.emit('conversation_created_success', { conversationId });
        } catch (error) {
            socket.emit('error', ChatWebSocketMapper.toErrorResponse(error as Error));
        }
    }

    private async updateMessage(socket: Socket, data: any): Promise<void> {
        try {
            const { messageId, content } = data;
            
            await this.updateMessageUseCase.execute(messageId, content);

            this.io.emit('message_updated', {
                messageId,
                content,
                timestamp: new Date().toISOString()
            });

            socket.emit('update_message_success', { messageId });
        } catch (error) {
            socket.emit('error', ChatWebSocketMapper.toErrorResponse(error as Error));
        }
    }

    private async deleteMessage(socket: Socket, data: any): Promise<void> {
        try {
            const { messageId } = data;
            
            await this.deleteMessageUseCase.execute(messageId);

            this.io.emit('message_deleted', {
                messageId,
                timestamp: new Date().toISOString()
            });

            socket.emit('delete_message_success', { messageId });
        } catch (error) {
            socket.emit('error', ChatWebSocketMapper.toErrorResponse(error as Error));
        }
    }

    private handleDisconnect(socket: Socket): void {
        const userId = socket.data.userId;
        if (userId) {
            this.io.emit('user_disconnected', {
                userId,
                timestamp: new Date().toISOString()
            });
        }
    }
}
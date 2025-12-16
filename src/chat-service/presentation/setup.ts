import { Server } from 'socket.io';
import { Container } from './conteiner';  
import { ChatWebSocketController } from './websocket/ChatWebSocketController';

export function setupWebSocketHandlers(io: Server): void {
    console.log(' Configurando WebSocket handlers...');
    
    try {
        const controller = new ChatWebSocketController(io);
        
        io.on('connection', (socket) => {
            console.log(` Nova conexão: ${socket.id}`);
            controller.initialize(socket);
        });
        
        console.log('WebSocket handlers configurados');
    } catch (error: any) {
        console.log(' Erro configurando WebSocket:', error.message);
        // Não falha a aplicação - continua sem WebSocket
    }
    
    // Configuração de eventos É OPCIONAL
    setupEventSubscriptionsSafe(io);
}

function setupEventSubscriptionsSafe(io: Server): void {
    console.log(' Tentando configurar subscriptions de eventos...');
    
    // Delay para garantir inicialização
    setTimeout(() => {
        try {
            const container = Container.getInstance();
            
            // Tenta obter EventBus, mas não falha se não existir
            let eventBus;
            try {
                eventBus = container.get<any>('EventBus');
            } catch {
                console.log('EventBus não registrado no Container');
                return;
            }
            
            if (!eventBus || typeof eventBus.subscribe !== 'function') {
                console.log(' EventBus inválido ou sem método subscribe');
                return;
            }
            
            // Configura subscriptions MOCK (para teste)
            eventBus.subscribe('MessageSentEvent', (event: any) => {
                console.log(' [MOCK] MessageSentEvent recebido:', event.messageId);
                io.emit('notification', {
                    type: 'MESSAGE_SENT',
                    data: event,
                    timestamp: new Date().toISOString()
                });
            });
            
            eventBus.subscribe('MessageReadEvent', (event: any) => {
                console.log(' [MOCK] MessageReadEvent recebido:', event.messageId);
                io.emit('notification', {
                    type: 'MESSAGE_READ',
                    data: event,
                    timestamp: new Date().toISOString()
                });
            });
            
            console.log(' Event subscriptions configurados (mock)');
            
        } catch (error: any) {
            console.log(' Erro configurando event subscriptions:', error.message);
            
        }
    }, 2000);
}
// presentation/WebSocket/server-simple.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const server = createServer(app);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', websocket: 'socket.io' });
});

const io = new Server(server, {
    cors: { origin: '*' }
});

// Handler MÍNIMO que sempre funciona
io.on('connection', (socket) => {
    console.log(' Cliente conectado:', socket.id);
    
    // Echo simples
    socket.onAny((eventName, ...args) => {
        console.log(` Evento: ${eventName}`, args);
        socket.emit(eventName + '_response', { 
            received: true, 
            data: args,
            timestamp: new Date().toISOString()
        });
    });
    
    // Eventos específicos do chat
    socket.on('join_conversation', (data) => {
        console.log('Usuário entrou:', data);
        socket.join(`room_${data.conversationId}`);
        socket.emit('join_success', { room: data.conversationId });
    });
    
    socket.on('send_message', (data) => {
        console.log(' Mensagem:', data);
        io.to(`room_${data.chatRoomId}`).emit('new_message', data);
        socket.emit('message_sent', { success: true, id: data.messageId });
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`CHAT SERVER :${PORT}`);
});
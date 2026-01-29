import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { handleClientMessage, handleDisconnect } from './handlers/connection';

// Store all connected clients
const clients = new Set<WebSocket>();

export function initializeWebSocketServer(httpServer: Server) {
    // Create WebSocket server attached to HTTP server
    const wss = new WebSocketServer({ server: httpServer});

    console.log('🔌 WebSocket server initialized');

    // Handle new client connections
    wss.on('connection', (ws: WebSocket) => {
        console.log('✅ New client connected');

        // Add client to our set
        clients.add(ws);

        // Send welcome message
        ws.send(JSON.stringify({
            type: 'CONNECTED',
            message: 'Welcome to Discover!'
        }));

        // Handle incoming messages from this client
        ws.on('message', (data: Buffer) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('📨 Received message:', message);

                // Route to handler
                handleClientMessage(ws, message);

            } catch (error) {
                console.error('❌ Error parsing message:', error);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Invalid message format'
                }));
            }
        });

        // Handle client disconnect
        ws.on('close', () => {
            console.log('👋 Client disconnected');
            handleDisconnect(ws);
            clients.delete(ws);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
            handleDisconnect(ws);
            clients.delete(ws);          
        });
    });

    return wss;
}

// Broadcast to all players who have joined the game
export function broadcast(message: object) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    // Bad design: I keep the require to know where it is
    const { getPlayerSockets } = require('./handlers/connection');
    const playerSockets = getPlayerSockets();

    playerSockets.forEach((socket: WebSocket) => {
        // Check if connection is open before sending
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(messageStr);
            sentCount++;
        }
    });

    console.log(`📢 Broadcast to ${sentCount} players:`, (message as any).type || 'message');
}

// Send message to specific client
export function sendToClient(client: WebSocket, message: object) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
}
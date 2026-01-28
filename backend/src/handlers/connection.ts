import { WebSocket } from 'ws';
import { ClientToServerMessage } from '../../../shared/index';
import { joinGame, leaveGame, startGame } from '../game/lobby';
import { sendToClient } from '../socketServer';

// Map WebSocket connections to player IDs
const socketToPlayerId = new Map<WebSocket, string>();
const playerIdToSocket = new Map<string, WebSocket>();

// Handle incoming messages from clients
export function handleClientMessage(ws: WebSocket, message: ClientToServerMessage): void {
    try {
        switch (message.type) {
            case 'JOIN_GAME':
                handleJoinGame(ws, message.playerName);
                break;
            
            case 'START_GAME':
                handleStartGame(ws);
                break;

            case 'SUBMIT_TRACK':
                // TODO: Implement in next section
                console.log('⚠️  SUBMIT_TRACK not yet implemented');
                break;
            
            case 'SELECT_TRACK':
                // TODO: Implement in next section
                console.log('⚠️  SELECT_TRACK not yet implemented');
                break;

            default:
                console.warn('Unknown message type:', (message as any).type);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sendToClient(ws, {
            type: 'ERROR',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Handle player joining
function handleJoinGame(ws: WebSocket, playerName: string): void {
    try {
        // Add player to lobby
        const player = joinGame(playerName);

        // Map this WebSocket to the player
        socketToPlayerId.set(ws, player.id);
        playerIdToSocket.set(player.id, ws);

        console.log(`✅ ${playerName} joined as ${player.id}`);
    } catch (error) {
        // Send error message
        sendToClient(ws, {
            type: 'ERROR',
            message: error instanceof Error ? error.message : 'Failed to join game'
        });

        // Close the connection since they can't join
        console.log(`❌ Closing connection: ${error instanceof Error ? error.message : 'Join failed'}`);
        ws.close(1008, error instanceof Error ? error.message : 'Failed to join game');
    }
}

// Handle player disconnecting
export function handleDisconnect(ws: WebSocket): void {
    const playerId = socketToPlayerId.get(ws);

    if (playerId) {
        leaveGame(playerId);
        socketToPlayerId.delete(ws);
        playerIdToSocket.delete(playerId);
    }
}

export function handleStartGame(ws: WebSocket): void {
    try {
        startGame();
    } catch (error) {
        // Send error message
        sendToClient(ws, {
            type: 'ERROR',
            message: error instanceof Error ? error.message : 'Failed to start game'
        });
    }
}

// Get player ID from WebSocket
export function getPlayerId(ws: WebSocket): string | undefined {
    return socketToPlayerId.get(ws);
}

// Get WebSocket from player ID
export function getSocket(playerId: string): WebSocket | undefined {
    return playerIdToSocket.get(playerId);
}
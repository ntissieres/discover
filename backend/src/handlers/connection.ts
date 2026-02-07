import { WebSocket } from 'ws';
import { ClientToServerMessage } from '../../../shared/index';
import { joinGame, leaveGame, startGame } from '../game/lobby';
import { sendToClient } from '../socketServer';
import { handleSelectTrack } from './selection';
import { handleSubmitTrack } from './trackSubmission';
import { handleReadyToSelect } from './readyToSelect';

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
                const submitPlayerId = socketToPlayerId.get(ws);
                if (!submitPlayerId) {
                    sendToClient(ws, {
                        type: 'ERROR',
                        message: 'You must join the game first'
                    });
                    return;
                }
                handleSubmitTrack(ws, message.track, submitPlayerId);
                break;

            case 'READY_TO_SELECT':
                const readyPlayerId = socketToPlayerId.get(ws);
                if (!readyPlayerId) {
                    sendToClient(ws, {
                        type: 'ERROR',
                        message: 'You must join the game first'
                    });
                    return;
                }
                handleReadyToSelect(ws, readyPlayerId);
                break;
            
            case 'SELECT_TRACK':
                const playerId = socketToPlayerId.get(ws);
                if (!playerId) {
                    sendToClient(ws, {
                        type: 'ERROR',
                        message: 'You must join the game first'
                    });
                    return;
                }
                handleSelectTrack(ws, message.trackId, playerId);
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
        // Add player to lobby (this broadcasts to existing players)
        const player = joinGame(playerName);

        // Map this WebSocket to the player (AFTER join so broadcast goes to others)
        socketToPlayerId.set(ws, player.id);
        playerIdToSocket.set(player.id, ws);

        // Send game state directly to the new player (since broadcast already went out)
        // Bad design. I keep the require to know where it is
        const { getGameState } = require('../game/gameState');
        sendToClient(ws, {
            type: 'GAME_STATE_UPDATE',
            gameState: getGameState()
        });

        console.log(`✅ ${playerName} joined as ${player.id}`);
    } catch (error) {
        // Send error message and let them retry
        sendToClient(ws, {
            type: 'ERROR',
            message: error instanceof Error ? error.message : 'Failed to join game'
        });

        console.log(`⚠️  Join failed: ${error instanceof Error ? error.message : 'Unknown error'} (connection kept open for retry)`);
        
        // Don't close connection - allow them to try again with a different name
        // They won't receive broadcasts since they're not in playerIdToSocket Map
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

// Get all player sockets
export function getPlayerSockets(): Set<WebSocket> {
    return new Set(playerIdToSocket.values());
}
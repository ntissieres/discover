import { ServerToClientMessage } from '../../../shared/index';
import { updateGameState } from '../game/gameState';

// Handle incoming server messages
export function handleServerMessage(message: ServerToClientMessage): void {
    switch (message.type) {
        case 'CONNECTED':
            handleConnected(message);
            break;

        case 'GAME_STATE_UPDATE':
            handleGameStateUpdate(message);
            break;

        case 'ERROR':
            handleError(message);
            break;

        default:
            console.warn('Unknown message type:', (message as any).type);
    }
}

// Handle connection confirmation
function handleConnected(message: { type: 'CONNECTED'; message: string }): void {
    console.log('🎉', message.message);
}

// Handle game state updates
function handleGameStateUpdate(message: { type: 'GAME_STATE_UPDATE'; gameState: any }): void {
    console.log('📥 Game state update received');
    updateGameState(message.gameState);
}

// Handle error messages
function handleError(message: { type: 'ERROR'; message: string }): void {
    console.error('❌ Server error:', message.message);

    // Show error to user (we'll improve this later)
    alert(`Error: ${message.message}`);
}
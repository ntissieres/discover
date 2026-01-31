import { ServerToClientMessage } from '../../../shared/index';
import { updateGameState, setLocalPlayerId, getLocalPlayerId } from '../game/gameState';

// Track if we're waiting for join confirmation
let waitingForJoinConfirmation = false;

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
    
    // Set local player ID FIRST (before updating state)
    // This ensures updateLobbyUI() has the correct localPlayerId when it runs
    if (waitingForJoinConfirmation && !getLocalPlayerId()) {
        const state = message.gameState;
        if (state.players && state.players.length > 0) {
            // The most recently added player is us (we just joined)
            const lastPlayer = state.players[state.players.length - 1];
            setLocalPlayerId(lastPlayer.id);
        }
    }

    // Now update the state (this triggers onStateChange which updateLobbyUI)
    updateGameState(message.gameState);
}

// Export function to set waiting flag when join is sent
export function setWaitingForJoin() {
    waitingForJoinConfirmation = true;
}

// Handle error messages
function handleError(message: { type: 'ERROR'; message: string }): void {
    console.error('❌ Server error:', message.message);

    // Show error to user (we'll improve this later)
    alert(`Error: ${message.message}`);
}
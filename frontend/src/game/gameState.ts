import { GameState, GamePhase } from '../../../shared/index';

// Local copy of game state
let currentGameState: GameState = {
    phase: GamePhase.LOBBY,
    roundTimeRemaining: 0,
    players: [],
    tracks: []
};

// Track local player ID (set when we join)
let localPlayerId: string | null = null;

// Callbacks for state changes
type StateChangeHandler = (state: GameState) => void;
let onStateChangeCallback: StateChangeHandler | null = null;

// Update the game state
export function updateGameState(newState: GameState): void {
    currentGameState = newState;
    console.log('🎮 Game state updated:', currentGameState.phase);

    // Notify listeners
    if (onStateChangeCallback) onStateChangeCallback(currentGameState);
}

// Get current game state
export function getGameState(): GameState {
    return { ...currentGameState }; // Return a copy
}

// Get current phase
export function getCurrentPhase(): GamePhase {
    return currentGameState.phase;
}

// Get all players
export function getPlayers() {
    return [...currentGameState.players]; // Return a copy
}

// Get all tracks
export function getTracks() {
    return [...currentGameState.tracks]; // Return a copy
}

// Register callback for state changes
export function onStateChange(callback: StateChangeHandler): void {
    onStateChangeCallback = callback;
}

// Set local player ID (called when joining)
export function setLocalPlayerId(playerId: string): void {
    localPlayerId = playerId;
    console.log('🎮 Local player ID set:', playerId);
}

// Get local player ID
export function getLocalPlayerId(): string | null {
    return localPlayerId;
}
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../../shared/index';
import { GAME_RULES, GamePhase } from '../../../shared/index';
import {
    addPlayer as addPlayerToState, 
    removePlayer as removePlayerFromState,
    getPlayerCount,
    setPhase,
    getGameState,
    resetGameState,
    clearTracks
} from './gameState';
import { broadcast } from '../socketServer';

// Join the game lobby
export function joinGame(playerName: string): Player {
    const currentState = getGameState();

    // Check username validity
    if (!playerName || playerName.trim().length === 0) {
        throw new Error('Player name cannot be empty');
    }

    // Check for duplicate names
    const existingPlayer = currentState.players.find(p => p.name === playerName);
    if (existingPlayer) {
        throw new Error('Player name already taken');
    }
    
    // Check if game is in lobby phase
    if (currentState.phase !== GamePhase.LOBBY) {
        throw new Error('Cannot join - game already in progress');
    }
    
    // Check if lobby is full
    if (getPlayerCount() >= GAME_RULES.MAX_PLAYERS) {
        throw new Error('Lobby is full');
    }

    // Create new player
    const player: Player = {
        id: uuidv4(),
        name: playerName,
        points: 0,
        connected: true
    };

    // Add to game state
    addPlayerToState(player);

    // Broadcast updated state to all clients
    broadcastGameState();

    return player;
}

// Leave the game lobby
export function leaveGame(playerId: string): void {
    removePlayerFromState(playerId);

    const playerCount = getPlayerCount();
    const currentState = getGameState();

    // If no players left, fully reset
    if (playerCount === 0) {
        console.log('⚠️  All players left, resetting game');
        resetGameState();
    }
    // If in-game and below minimum, go back to lobby but keep remaining players
    else if (playerCount < GAME_RULES.MIN_PLAYERS && currentState.phase !== GamePhase.LOBBY) {
        console.log('⚠️  Not enough players to continue, returning to lobby');
        setPhase(GamePhase.LOBBY);
        clearTracks();
    }
    // Otherwise just stay in current state with remaining players

    // Broadcast updated state
    broadcastGameState();
}

// Check if game can start
export function canStartGame(): boolean {
    const playerCount = getPlayerCount();
    return playerCount >= GAME_RULES.MIN_PLAYERS
        && playerCount <= GAME_RULES.MAX_PLAYERS;
}

// Start the game
export function startGame(): void {
    if (!canStartGame()) {
        throw new Error(`Cannot start game. Need ${GAME_RULES.MIN_PLAYERS}-${GAME_RULES.MAX_PLAYERS} players.`);
    }

    // Check current phase
    const currentState = getGameState();
    if (currentState.phase !== GamePhase.LOBBY) {
        throw new Error('Game already started');
    }

    console.log('🎮 Starting game!');

    // Clear any old tracks from previous games
    clearTracks();

    // Transition to CREATION phase
    setPhase(GamePhase.CREATION);

    // Broadcast new state
    broadcastGameState();
}

// Helper to broadcast current game state
function broadcastGameState(): void {
    broadcast({
        type: 'GAME_STATE_UPDATE',
        gameState: getGameState()
    })
}
import { GameState, GamePhase, Player, Track, GAME_RULES } from '../../../shared/index';

// Single game state instance
let gameState: GameState = {
    phase: GamePhase.LOBBY,
    roundTimeRemaining: GAME_RULES.ROUND_DURATION_SECONDS,
    players: [],
    tracks: []
};

// Get current game state (read-only)
export function getGameState(): GameState {
    return { ...gameState }; // Return a copy to prevent external modifications
}

// Reset game state to initial values
export function resetGameState(): void {
    gameState = {
        phase: GamePhase.LOBBY,
        roundTimeRemaining: GAME_RULES.ROUND_DURATION_SECONDS,
        players: [],
        tracks: []
    };
    console.log('🔄 Game state reset');
}

// Add a new player
export function addPlayer(player: Player): void {
    gameState.players.push(player);
    console.log(`➕ Player added: ${player.name} (${player.id})`);
}

// Remove a player by ID
export function removePlayer(playerId: string): void {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        const player = gameState.players[playerIndex];
        gameState.players.splice(playerIndex, 1);
        console.log(`➖ Player removed: ${player.name} (${player.id})`);
    }
}

// Find a player by ID
export function getPlayerById(playerId: string): Player | undefined {
    return gameState.players.find(p => p.id === playerId);
}

// Update game phase
export function setPhase(newPhase: GamePhase): void {
    const oldPhase = gameState.phase;
    gameState.phase = newPhase;
    console.log(`🎮 Phase changed: ${oldPhase} → ${newPhase}`);
}

// Add a track
export function addTrack(track: Track): void {
    gameState.tracks.push(track);
    console.log(`🎵 Track added from player ${track.ownerPlayerId}`);
}

// Clear all tracks (for new round)
export function clearTracks(): void {
    gameState.tracks = [];
    console.log('🗑️ All tracks cleared');
}

// Get number of players
export function getPlayerCount(): number {
    return gameState.players.length;
}
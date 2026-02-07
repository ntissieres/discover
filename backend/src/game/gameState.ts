import { GameState, GamePhase, Player, Track, GAME_RULES } from '../../../shared/index';
import { broadcast } from '../socketServer';

// Single game state instance
let gameState: GameState = {
    phase: GamePhase.LOBBY,
    roundTimeRemaining: GAME_RULES.ROUND_DURATION_SECONDS,
    players: [],
    tracks: [],
    selections: {},
    readyToSelectPlayers: []
};

// Get current game state (read-only)
export function getGameState(): GameState {
    return { 
        ...gameState,
        selections: Object.fromEntries(selections), // Convert Map to object
        readyToSelectPlayers: Array.from(readyToSelectPlayers) // Convert Set to array
     };
}

// Reset game state to initial values
export function resetGameState(): void {
    gameState = {
        phase: GamePhase.LOBBY,
        roundTimeRemaining: GAME_RULES.ROUND_DURATION_SECONDS,
        players: [],
        tracks: [],
        selections: {},
        readyToSelectPlayers: []
    };
    clearSelections();
    clearReadyToSelectPlayers();
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

// Selection tracking: Map of playerId -> trackId they voted for
const selections = new Map<string, string>();

// Record a player's selection
export function recordSelection(playerId: string, trackId: string): boolean {
    // Validate: track exists
    const trackExists = gameState.tracks.some(t => t.id === trackId);
    if (!trackExists) {
        console.log(`❌ Invalid selection: track ${trackId} not found`);
        return false;
    }

    // Validate: player isn't voting for their own track
    const track = gameState.tracks.find(t => t.id === trackId);
    if (track && track.ownerPlayerId === playerId) {
        console.log(`❌ Invalid selection: player ${playerId} tried to vote for own track`);
        return false;
    }

    // Record the selection (overwrites if player changes vote)
    selections.set(playerId, trackId);
    console.log(`✅ Player ${playerId} selected track ${trackId}`);

    return true;
}

// Get all selections
export function getSelections(): Map<string, string> {
    return new Map(selections); // Return a copy
}

// Clear selections (for new round)
export function clearSelections(): void {
    selections.clear();
    console.log('🗑️ All selections cleared');
}

// Check if all players have voted
export function haveAllPlayersVoted(): boolean {
    // Only count connected players
    const connectedPlayers = gameState.players.filter(p => p.connected);
    const connectedPlayerCount = connectedPlayers.length;
    
    // Count votes from connected players only
    const votesFromConnectedPlayers = connectedPlayers.filter(p => selections.has(p.id)).length;

    const allVoted = connectedPlayerCount > 0 && votesFromConnectedPlayers === connectedPlayerCount;

    if (allVoted) {
        console.log(`✅ All ${connectedPlayerCount} connected players have voted`);
    }

    return allVoted;
}

// Ready tracking: set of player IDs who are ready to select
const readyToSelectPlayers = new Set<string>();

// Mark a player as ready
export function markPlayerReadyToSelect(playerId: string): void {
    readyToSelectPlayers.add(playerId);
    console.log(`✅ Player ${playerId} is ready to select`);
}

// Get ready players
export function getReadyToSelectPlayers(): Set<string> {
    return new Set(readyToSelectPlayers); // Return a copy
}

// Clear ready to select players (for new round)
export function clearReadyToSelectPlayers(): void {
    readyToSelectPlayers.clear();
    console.log('🗑️ All ready to select players cleared');
}

// Check if all players are ready
export function areAllPlayersReadyToSelect(): boolean {
    // Only count connected players
    const connectedPlayers = gameState.players.filter(p => p.connected);
    const connectedPlayerCount = connectedPlayers.length;
    
    // Count ready status from connected players only
    const readyConnectedPlayers = connectedPlayers.filter(p => readyToSelectPlayers.has(p.id)).length;

    const allReady = connectedPlayerCount > 0 && readyConnectedPlayers === connectedPlayerCount;

    if (allReady) {
        console.log(`✅ All ${connectedPlayerCount} connected players are ready to select`);
    }

    return allReady;
}

// Get number of players
export function getPlayerCount(): number {
    return gameState.players.length;
}

// Timer for countdown
let countdownInterval: NodeJS.Timeout | null = null;

// Start the round timer (call when entering CREATION phase)
export function startRoundTimer(): void {
    // Clear any existing timer
    stopRoundTimer();

    console.log(`⏱️ Starting round timer: ${gameState.roundTimeRemaining}s`);

    countdownInterval = setInterval(() => {
        // Decrement time
        gameState.roundTimeRemaining = Math.max(0, gameState.roundTimeRemaining - 1);

        // Broadcast updated state to all clients
        broadcast({
            type: 'GAME_STATE_UPDATE',
            gameState: getGameState()
        });

        // Check if time expired
        if (gameState.roundTimeRemaining === 0) {
            console.log('⏰ Round timer expired');
            stopRoundTimer();

            // TODO: Transition to next phase
            // For now, just log - we'll implement phase transitions later
        }
    }, 1000); // Every second
}

// Stop the round timer
export function stopRoundTimer(): void {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        console.log('⏹️ Round timer stopped');
    }
}

// Reset timer to full duration
export function resetRoundTimer(): void {
    gameState.roundTimeRemaining = GAME_RULES.ROUND_DURATION_SECONDS;
}

// Calculate and update player points from selections
export function updatePlayerPoints(): void {
    // Count votes for each track
    const votesPerTrack = new Map<string, number>();

    selections.forEach((trackId) => {
        votesPerTrack.set(trackId, (votesPerTrack.get(trackId) || 0) + 1);
    });

    // Award points to track creators
    votesPerTrack.forEach((voteCount, trackId) => {
        const track = gameState.tracks.find(t => t.id === trackId);
        if (track) {
            const player = gameState.players.find(p => p.id === track.ownerPlayerId);
            if (player) {
                player.points += voteCount;
                console.log(`🏆 ${player.name} earned ${voteCount} point(s)`);
            }
        }
    });

    console.log('✅ Player points updated');
}
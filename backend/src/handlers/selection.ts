import { WebSocket } from 'ws';
import { recordSelection, haveAllPlayersVoted, setPhase, stopRoundTimer, getGameState, updatePlayerPoints } from '../game/gameState';
import { broadcast } from '../socketServer';
import { GamePhase } from '../../../shared/index';

export function handleSelectTrack(ws: WebSocket, trackId: string, playerId: string): void {
    console.log(`🗳️ Player ${playerId} selecting track: ${trackId}`);

    // Record the selection (validation happens inside recordSelection)
    const success = recordSelection(playerId, trackId);
    if (!success) {
        // Validation failed - selection already logged the error
        return;
    }

    // Broadcast updated state to all players
    broadcast({
        type: 'GAME_STATE_UPDATE',
        gameState: getGameState()
    });

    // Check if all players have voted
    if (haveAllPlayersVoted()) {
        console.log('🎉 All votes received! Transitioning to RESULTS...');

        // Update player points based on votes
        updatePlayerPoints();

        // Stop any timer
        stopRoundTimer();

        // Transition to RESULTS phase
        setPhase(GamePhase.RESULTS);

        // Broadcast the phase change
        broadcast({
            type: 'GAME_STATE_UPDATE',
            gameState: getGameState()
        });
    }
}
import { WebSocket } from 'ws';
import { markPlayerReadyToSelect, areAllPlayersReadyToSelect, setPhase, getGameState, clearReadyToSelectPlayers } from '../game/gameState';
import { broadcast } from '../socketServer';
import { GamePhase } from '../../../shared/index';

export function handleReadyToSelect(ws: WebSocket, playerId: string): void {
    console.log(`👍 Player ${playerId} is ready`);

    // Mark player as ready
    markPlayerReadyToSelect(playerId);

    // Broadcast updated state (so UI can show who's ready)
    broadcast({
        type: 'GAME_STATE_UPDATE',
        gameState: getGameState()
    });

    // Check if all players are ready
    if (areAllPlayersReadyToSelect()) {
        console.log('🎉 All players ready! Transitioning to SELECTION...');
        
        // Clear ready state for next time
        clearReadyToSelectPlayers();
        
        // Transition to SELECTION phase
        setPhase(GamePhase.SELECTION);
        
        // Broadcast the phase change
        broadcast({
            type: 'GAME_STATE_UPDATE',
            gameState: getGameState()
        });
    }
}
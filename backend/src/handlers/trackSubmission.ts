import { WebSocket } from 'ws';
import type { Track } from '../../../shared/types/track';
import { addTrack, getGameState, getPlayerCount, setPhase, stopRoundTimer } from '../game/gameState';
import { broadcast } from '../socketServer';
import { GamePhase } from '../../../shared/index';
import { v4 as uuidv4 } from 'uuid';

export function handleSubmitTrack(ws: WebSocket, track: Track, playerId: string): void {
    console.log(`📤 Player ${playerId} submitting track`);

    // Check if player already submitted (reject if so - UI should prevent this)
    const state = getGameState();
    const existingTrack = state.tracks.find(t => t.ownerPlayerId === playerId);
    if (existingTrack) {
        console.log(`❌ Player ${playerId} already submitted a track`);
        return;
    }

    // Validate track data
    if (!track.melody || !track.synthSettings) {
        console.log(`❌ Invalid track data from player ${playerId}`);
        return;
    }

    // Create track with unique ID and owner
    const newTrack: Track = {
        id: uuidv4(),
        ownerPlayerId: playerId,
        synthSettings: track.synthSettings,
        melody: track.melody
    };

    // Add track to game state
    addTrack(newTrack);

    // Broadcast updated state
    broadcast({
        type: 'GAME_STATE_UPDATE',
        gameState: getGameState()
    });

    // Check if all players have submitted
    const playerCount = getPlayerCount();
    const trackCount = getGameState().tracks.length;

    if (trackCount === playerCount && playerCount > 0) {
        console.log('🎉 All players submitted! Transitioning to LISTENING...');

        // Stop the timer
        stopRoundTimer();

        // Transition to LISTENING phase
        setPhase(GamePhase.LISTENING);

        // Broadcast phase change
        broadcast({
            type: 'GAME_STATE_UPDATE',
            gameState: getGameState()
        });
    } else {
        console.log(`📊 Tracks submitted: ${trackCount}/${playerCount}`)
    }
}
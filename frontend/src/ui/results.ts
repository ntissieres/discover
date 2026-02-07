import type { Player } from '../../../shared/types/player';
import type { Track } from '../../../shared/types/track';
import { getLocalPlayerId } from '../game/gameState';
import { sendMessage } from '../network/socket';

// Initialize the results phase UI
export function initResults(): void {
    const container = document.getElementById('results-container');
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create title
    const title = document.createElement('h2');
    title.textContent = '🏆 Results';
    container.appendChild(title);

    // Create scoreboard section
    const scoreboard = document.createElement('div');
    scoreboard.id = 'results-scoreboard';
    container.appendChild(scoreboard);

    // Create track breakdown section
    const breackdown = document.createElement('div');
    breackdown.id = 'results-breakdown';
    breackdown.innerHTML = '<h3>Track Breakdown</h3>';
    container.appendChild(breackdown);

    // Add restart button section (only visible to host)
    const restartSection = document.createElement('div');
    restartSection.id = 'restart-section';
    restartSection.style.textAlign = 'center';
    restartSection.style.marginTop = '30px';
    
    const restartBtn = document.createElement('button');
    restartBtn.id = 'restart-btn';
    restartBtn.className = 'restart-btn';
    restartBtn.textContent = '🔄 Play Again';
    restartBtn.style.display = 'none'; // Hidden by default
    restartBtn.onclick = handleRestartGame;
    
    restartSection.appendChild(restartBtn);
    container.appendChild(restartSection);

    console.log('✅ Results UI initialized');
}

// Update the results UI with scores and track info
export function updateResultsUI(
    players: Player[],
    tracks: Track[],
    selections: { [playerId: string]: string },
    localPlayerId: string
): void {
    updateScoreboard(players);
    updateTrackBreakdown(tracks, players, selections);

    // Show restart button only for host (first player)
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn && players.length > 0) {
        const isHost = players[0].id === localPlayerId;
        restartBtn.style.display = isHost ? 'block' : 'none';
    }
    
    console.log('🏆 Results displayed');
}

// Update the scoreboard with player rankings
function updateScoreboard(players: Player[]): void {
    const scoreboard = document.getElementById('results-scoreboard');
    if (!scoreboard) return;

    // Sort players by points (highest first)
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

    // Find the highest score (for winner detection)
    const highestScore = sortedPlayers[0]?.points || 0;

    // Clear exisitng content
    scoreboard.innerHTML = '<h3>Scoreboard</h3>';

    // Create player list
    const playerList = document.createElement('div');
    playerList.className = 'player-results-list';

    sortedPlayers.forEach((player, index) => {
        const isWinner = player.points === highestScore && highestScore > 0;
        const playerCard = createPlayerResultCard(player, index + 1, isWinner);
        playerList.appendChild(playerCard);
    });

    scoreboard.appendChild(playerList);
}

// Create a result card for a single player
function createPlayerResultCard(player: Player, rank: number, isWinner: boolean): HTMLElement {
    const card = document.createElement('div');
    card.className = 'player-result-card';

    if (isWinner) {
        card.classList.add('winner');
    }

    // Rank
    const rankEl = document.createElement('div');
    rankEl.className = 'player-rank';
    rankEl.textContent = `#${rank}`;

    // Name
    const nameEl = document.createElement('div');
    nameEl.className = 'player-name';
    nameEl.textContent = player.name;
    if (isWinner) {
        nameEl.textContent += ' 👑';
    }

    // Points
    const pointsEl = document.createElement('div');
    pointsEl.className = 'player-points';
    pointsEl.textContent = `${player.points} point${player.points !== 1 ? 's' : ''}`;

    card.appendChild(rankEl);
    card.appendChild(nameEl);
    card.appendChild(pointsEl);

    return card;
}

// Update the track breakdown section
function updateTrackBreakdown(
    tracks: Track[],
    players: Player[],
    selections: { [playerId: string]: string }
): void {
    const breakdown = document.getElementById('results-breakdown');
    if (!breakdown) return;

    // Clear existing content (keep the h3)
    const title = breakdown.querySelector('h3');
    breakdown.innerHTML = '';
    if (title) breakdown.appendChild(title);

    // Create track list
    const trackList = document.createElement('div');
    trackList.className = 'track-breakdown-list';

    tracks.forEach((track, index) => {
        const trackNumber = index + 1;
        const creator = players.find(p => p.id === track.ownerPlayerId);
        const voteCount = getTrackVoteCount(track.id, selections);

        const trackCard = createTrackBreakdownCard(trackNumber, creator?.name || 'Unknown', voteCount);
        trackList.appendChild(trackCard);
    });

    breakdown.appendChild(trackList);
}

// Create a breakdown card for a track
function createTrackBreakdownCard(trackNumber: number, creatorName: string, voteCount: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'track-breakdown-card';

    // Track info
    const info = document.createElement('div');
    info.className = 'track-info';
    info.innerHTML = `<strong>Track #${trackNumber}</strong> by ${creatorName}`;

    // Vote count
    const votes = document.createElement('div');
    votes.className = 'track-votes';
    votes.textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''}`;

    card.appendChild(info);
    card.appendChild(votes);

    return card;
}

// Count how many votes a track received
function getTrackVoteCount(trackId: string, selections: { [playerId: string]: string }): number {
    return Object.values(selections).filter(selectedTrackId => selectedTrackId === trackId).length;
}

// Reset the results UI state
export function resetResultsUI(): void {
    const scoreboard = document.getElementById('results-scoreboard');
    if (scoreboard) {
        scoreboard.innerHTML = '';
    }
    const breakdown = document.getElementById('results-breakdown');
    if (breakdown) {
        breakdown.innerHTML = '';
    }
    console.log('🔄 Results UI reset');
}

// Handle restart game button click
function handleRestartGame(): void {
    console.log('🔄 Restarting game...');

    // Send START_GAME message (same as starting from lobby)
    sendMessage({
        type: 'START_GAME'
    });
}
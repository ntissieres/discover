import type { Track } from '../../../shared/types/track';
import { getLocalPlayerId } from '../game/gameState';
import { sendMessage } from '../network/socket';

let selectedTrackId: string | null = null;

// Initialize selection phase UI
export function initSelection(): void {
    const container = document.getElementById('selection-container');
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create title
    const title = document.createElement('h2');
    title.textContent = '🗳️ Vote for Your Favorite Track';
    container.appendChild(title);

    // Create status message (styled in CSS)
    const status = document.createElement('div');
    status.id = 'selection-status';
    container.appendChild(status);

    // Create tracks list container
    const tracksList = document.createElement('div');
    tracksList.id = 'selection-tracks-list';
    container.appendChild(tracksList);

    console.log('✅ Selection UI initialized');
}

// Update the selection UI with current tracks and selections
export function updateSelectionUI(
    tracks: Track[],
    localPlayerId: string,
    selections: { [playerId: string]: string }
): void {
    const tracksList = document.getElementById('selection-tracks-list');
    if (!tracksList) return;

    // Clear existing tracks
    tracksList.innerHTML = '';

    if (tracks.length === 0) {
        tracksList.innerHTML = '<p style="text-align: center; color: #888;">No tracks available</p>';
        return;
    }

    // Get what the local player selected (if anything)
    const localSelection = selections[localPlayerId];

    // Create a card for each track
    tracks.forEach((track, index) => {
        const trackNumber = index + 1;
        const isOwnTrack = track.ownerPlayerId === localPlayerId;
        const isSelected = localSelection === track.id;

        const card = createTrackCard(track, trackNumber, isOwnTrack, isSelected);
        tracksList.appendChild(card);
    });

    // Update status message
    updateStatusMessage(localSelection !== undefined);

    console.log(`🗳️ Displayed ${tracks.length} tracks for voting`);
}

// Create a card UI for a single track
function createTrackCard(
    track: Track,
    trackNumber: number,
    isOwnTrack: boolean,
    isSelected: boolean
): HTMLElement {
    const card = document.createElement('div');
    card.className = 'selection-card';
    card.id = `selection-card-${track.id}`;

    if (isSelected) {
        card.classList.add('selected');
    }

    // Left side: Track label
    const label = document.createElement('div');
    label.className = 'track-label';
    label.textContent = `Track #${trackNumber}`;

    // Right side: Vote button
    const voteBtn = document.createElement('button');
    voteBtn.className = 'vote-btn';

    if (isOwnTrack) {
        voteBtn.textContent = 'Your Track';
        voteBtn.disabled = true;
        voteBtn.classList.add('own-track');
    } else if (isSelected) {
        voteBtn.textContent = '✓ Voted';
        voteBtn.classList.add('selected');
        voteBtn.onclick = () => handleVote(track.id);
    } else {
        voteBtn.textContent = 'Vote';
        voteBtn.onclick = () => handleVote(track.id);
    }

    card.appendChild(label);
    card.appendChild(voteBtn);

    return card;
}

// Handle voting for a track
function handleVote(trackId: string): void {
    console.log(`🗳️ Voting for track ${trackId}`);

    selectedTrackId = trackId;

    // Send vote to server
    sendMessage({
        type: 'SELECT_TRACK',
        trackId: trackId
    });
}

// Update the status message based on voting state
function updateStatusMessage(hasVoted: boolean): void {
    const status = document.getElementById('selection-status');
    if (!status) return;

    if (hasVoted) {
        status.style.display = 'block';
        status.textContent = '⏳ Waiting for other players to vote...';
    } else {
        status.style.display = 'none';
    }
}

// Reset the selection UI state
export function resetSelectionUI(): void {
    selectedTrackId = null;
    const tracksList = document.getElementById('selection-tracks-list');
    if (tracksList) {
        tracksList.innerHTML = '';
    }
    const status = document.getElementById('selection-status');
    if (status) {
        status.style.display = 'none';
    }
    console.log('🔄 Selection UI reset');
}
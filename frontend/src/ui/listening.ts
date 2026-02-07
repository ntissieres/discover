import type { Track } from '../../../shared/types/track';
import { MelodyPlayer } from '../melody/player';
import { Synth } from '../audio/synth';
import { sendMessage } from '../network/socket';

// Track which track is currently playing
let currentlyPlayingTrackId: string | null = null;
let currentPlayer: MelodyPlayer | null = null;

// Track if local player is ready to select
let isLocalPlayerReadyToSelect = false;

// Initialize the listening phase UI
// Shows all submitted tracks with play buttons
export function initListening(): void {
    const container = document.getElementById('listening-container');
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create title
    const title = document.createElement('h2');
    title.textContent = '🎧 Listen to All Tracks';
    container.appendChild(title);

    // Create tracks list container
    const tracksList = document.createElement('div');
    tracksList.id = 'tracks-list';
    container.appendChild(tracksList);

    // Create ready selection (button + status)
    const readySection = document.createElement('div');
    readySection.id = 'ready-section';
    
    const readyBtn = document.createElement('button');
    readyBtn.id = 'ready-btn';
    readyBtn.className = 'ready-btn';
    readyBtn.textContent = 'Ready to Vote';
    readyBtn.onclick = handleReadyToSelect;
    
    const readyStatus = document.createElement('div');
    readyStatus.id = 'ready-status';
    readyStatus.style.display = 'none';
    
    readySection.appendChild(readyBtn);
    readySection.appendChild(readyStatus);
    container.appendChild(readySection);

    console.log('✅ Listening UI initialized');
}

// Update the listening UI with current tracks (anonymous)
export function updateListeningUI(tracks: Track[], localPlayerId: string, readyPlayers: string[]): void {
    const tracksList = document.getElementById('tracks-list');
    if (!tracksList) return;

    // Clear existing tracks
    tracksList.innerHTML = '';

    if (tracks.length === 0) {
        tracksList.innerHTML = '<p>No tracks submitted yet</p>';
        return;
    }

    // Create a card for each track (anonymous - just numbered)
    tracks.forEach((track, index) => {
        const trackNumber = index + 1; // Start from 1
        const card = createTrackCard(track, trackNumber);
        tracksList.appendChild(card);
    });

    // Update ready button state
    updateReadyToSelectButton(localPlayerId, readyPlayers, tracks.length);

    console.log(`🎵 Displayed ${tracks.length} tracks`)
}

// Create a card UI for a single track (anonymous)
function createTrackCard(track: Track, trackNumber: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.id = `track-card-${track.id}`;

    // Left side: Anonymous track label
    const label = document.createElement('div');
    label.className = 'track-label';
    label.textContent = `Track #${trackNumber}`;

    // Right side: Play/Stop button
    const playBtn = document.createElement('button');
    playBtn.className = 'play-track-btn';
    playBtn.textContent = '▶️ Play';
    playBtn.onclick = () => handlePlayTrack(track, card, playBtn);

    card.appendChild(label);
    card.appendChild(playBtn);

    return card;
}

// Handle playing a track (with looping)
function handlePlayTrack(track: Track, card: HTMLElement, button: HTMLButtonElement): void {
    // If this track is already playing, stop it
    if (currentlyPlayingTrackId === track.id) {
        stopCurrentTrack();
        return;
    }

    // Stop any other track that's playing
    if (currentlyPlayingTrackId) {
        stopCurrentTrack();
    }

    // Start playing this track
    currentlyPlayingTrackId = track.id;

    // Update button text and card appearance
    button.textContent = '⏹️ Stop';
    card.classList.add('playing');

    // Recreate the synth with the track's exact settings
    const synth = new Synth(track.synthSettings);

    // Create a player with the track's BPM and synth (assign only the synth in third position, others take defaults)
    currentPlayer = new MelodyPlayer(undefined, undefined, synth);

    // Play with looping enabled
    currentPlayer.play(track.melody, true);

    const trackNumber = Array.from(card.parentElement!.children).indexOf(card) + 1;
    console.log(`▶️ Playing track #${trackNumber})`);
}

// Stop the currently playing track
function stopCurrentTrack(): void {
    if (!currentlyPlayingTrackId) return;

    // Stop the player
    if (currentPlayer) {
        currentPlayer.stop();
        currentPlayer = null;
    }

    // Find the card and button to reset UI
    const card = document.getElementById(`track-card-${currentlyPlayingTrackId}`);
    if (card) {
        const button = card.querySelector('.play-track-btn') as HTMLButtonElement;
        if (button) {
            button.textContent = '▶️ Play';
        }
        card.classList.remove('playing');
    }

    currentlyPlayingTrackId = null;
    console.log('⏹️ Stopped playback');
}

// Reset the listening UI state
export function resetListeningUI(): void {
    stopCurrentTrack();
    isLocalPlayerReadyToSelect = false;
    const tracksList = document.getElementById('tracks-list');
    if (tracksList) {
        tracksList.innerHTML = '';
    }
    console.log('🔄 Listening UI reset');
}

// Handle ready to select button click
function handleReadyToSelect(): void {
    console.log('👍 Player ready to vote');

    isLocalPlayerReadyToSelect = true;

    // Send READY_TO_SELECT message to server
    sendMessage({
        type: 'READY_TO_SELECT'
    });
}

function updateReadyToSelectButton(localPlayerId: string, readyPlayers: string[], playerCount: number): void {
    const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement;
    const readyStatus = document.getElementById('ready-status');
    if (!readyBtn || !readyStatus) return;

    const isReady = readyPlayers.includes(localPlayerId);
    const readyCount = readyPlayers.length;

    if (isReady) {
        // Player has clicked ready
        readyBtn.disabled = true;
        readyBtn.textContent = '✓ Ready';
        readyBtn.classList.add('ready-confirmed');

        readyStatus.style.display = 'block';
        readyStatus.textContent = `⏳ Waiting for ${playerCount - readyCount} other player(s)...`;
    } else {
        // Player hasn't clicked ready yet
        readyBtn.disabled = false;
        readyBtn.textContent = 'Ready to Vote';
        readyBtn.classList.remove('ready-confirmed');
        readyStatus.style.display = 'none';
    }
}
import { connectToServer, onMessage, onOpen } from './network/socket';
import { handleServerMessage } from './network/handlers';
import { onStateChange, getLocalPlayerId } from './game/gameState';
import { initAudioContext } from './audio/audioContext';
import { initPlayback, playNoteName, stopNote, midiToFrequency, noteNameToMidi } from './audio/playback';
import { initCreation, resetCreationUI, updateCreationTimer } from './ui/creation';
import { updateLobbyUI, initLobby } from './ui/lobby';

console.log('🎮 Discover - Starting...');

// Initialize audio on first user interaction
let audioInitialized = false;

function tryInitAudio() {
    if (audioInitialized) return;

    try {
        initAudioContext();
        initPlayback(); // Initialize playback system
        audioInitialized = true;
        console.log('🔊 Audio is ready!');

        // Remove the click listener once initialized
        document.removeEventListener('click', tryInitAudio);
    } catch (error) {
        console.error('Failed to initialize audio:', error);
    }
}

function testSynth() {
    console.log('🎹 Testing synthesizer...');

    // Initialize playback
    initPlayback();

    // Test conversions
    console.log('Middle C (MIDI 60):', midiToFrequency(60), 'Hz');
    console.log('A4 (MIDI 69):', midiToFrequency(69), 'Hz');
    console.log('Note name "C4" =', noteNameToMidi("C4"));
    console.log('Note name "A4" =', noteNameToMidi("A4"));

    // Play a melody
    const melody = [
        { note: "C4", duration: 500 },
        { note: "E4", duration: 500 },
        { note: "G4", duration: 500 },
        { note: "C5", duration: 1000 }
    ];

    let delay = 0;
    melody.forEach((item, index) => {
        setTimeout(() => {
            console.log(`Playing: ${item.note}`);
            playNoteName(item.note);

            setTimeout(() => {
                stopNote();
            }, item.duration - 50); // Stop slightly before next note

            if (index === melody.length - 1) {
                setTimeout(() => {
                    console.log('✅ Melody complete!');
                }, item.duration);
            }
        }, delay);

        delay += item.duration;
    });
}

// Wait for any click to initialize audio
document.addEventListener('click', tryInitAudio);

// Handle connection opened
onOpen(() => {
    console.log('✅ Connected. Ready to play!');
});

// Route all messages through handler
onMessage((message) => {
    handleServerMessage(message);
});

// Track previous phase to detect transitions
let previousPhase: string | null = null;

// React to state changes
onStateChange((state) => {
    console.log('🎯 Phase changed to:', state.phase);
    console.log('👥 Players:', state.players.length);

    const localPlayerId = getLocalPlayerId();

    // If we're not a player, always show lobby (spectator mode)
    if (!localPlayerId) {
        showPhaseContainer('LOBBY');
        updateLobbyUI();
        previousPhase = state.phase;
        return;
    }

    // We're a player - show appropriate phase UI
    if (state.phase === 'LOBBY') {
        updateLobbyUI();
    }

    // Handle CREATION phase
    if (state.phase === 'CREATION') {
        // Only reset UI when we TRANSITION into creation phase
        // (not on every timer tick)
        if (previousPhase !== 'CREATION') {
            console.log('🆕 Entering CREATION phase - resetting UI');
            resetCreationUI();
        }

        // Update timer display every time (even during ticks)
        updateCreationTimer(state.roundTimeRemaining);
    }

    // Show/hide phase containers based on current phase
    showPhaseContainer(state.phase);
    
    // Remember current phase for next update
    previousPhase = state.phase;
});

// Show the correct phase container
function showPhaseContainer(phase: string): void {
    // Hide all containers
    const containers = document.querySelectorAll('.phase-container');
    containers.forEach(container => {
        (container as HTMLElement).style.display = 'none';
    });

    // Show the active one
    let activeContainerId = '';
    switch (phase) {
        case 'LOBBY':
            activeContainerId = 'lobby-content';
            break;
        case 'CREATION':
            activeContainerId = 'creation-container';
            break;
        case 'LISTENING':
            activeContainerId = 'listening-container';
            break;
        case 'SELECTION':
            activeContainerId = 'selection-container';
            break;
        case 'RESULTS':
            activeContainerId = 'results-container';
            break;
    }

    if (activeContainerId) {
        const activeContainer = document.getElementById(activeContainerId);
        if (activeContainer) {
            activeContainer.style.display = 'block';
            console.log(`📺 Showing ${phase} phase`);
        }
    }
}

// Connect to server
connectToServer('ws://localhost:3000');

// Initialize lobby UI
initLobby('lobby-content');
updateLobbyUI();

// Initialize creation UI (creates grid and player internally)
const { grid: melodyGrid, player: melodyPlayer } = initCreation();

// Test playing a melody
function testMelodyPlayback() {
    const melody = melodyGrid.serialize();

    if (melody.notes.length === 0) {
        console.log('⚠️  Grid is empty, add some notes first!');
        return;
    }

    melodyPlayer.play(melody, true); // Play with loop
}

// Quick test with pre-made melody (chords + sequential notes)
function quickTest() {
    // Initialize audio if needed
    if (!audioInitialized) {
        tryInitAudio();
    }

    console.log('🎵 Quick test: Playing pre-made melody with chords and close notes');
    
    // Create a test melody with chords and sequential notes
    const testMelody = {
        steps: 16,
        notes: [
            // Step 0: C major chord (C-E-G)
            { step: 0, pitch: 0 },  // C
            { step: 0, pitch: 4 },  // E
            { step: 0, pitch: 7 },  // G
            
            // Step 2: Single note
            { step: 2, pitch: 2 },  // D
            
            // Step 3: Two close notes
            { step: 3, pitch: 3 },  // Eb
            { step: 3, pitch: 4 },  // E
            
            // Step 4: F major chord
            { step: 4, pitch: 5 },  // F
            { step: 4, pitch: 9 },  // A
            { step: 4, pitch: 12 }, // C
            
            // Step 6-7: Sequential single notes (close timing)
            { step: 6, pitch: 7 },  // G
            { step: 7, pitch: 8 },  // Ab
            
            // Step 8: G major chord
            { step: 8, pitch: 7 },  // G
            { step: 8, pitch: 11 }, // B
            { step: 8, pitch: 14 }, // D
            
            // Step 10-11-12: Fast sequential notes
            { step: 10, pitch: 9 },  // A
            { step: 11, pitch: 10 }, // Bb
            { step: 12, pitch: 11 }, // B
            
            // Step 14: Final chord
            { step: 14, pitch: 0 },  // C
            { step: 14, pitch: 7 },  // G
            { step: 14, pitch: 12 }, // C (octave)
        ]
    };

    melodyPlayer.stop(); // Stop any current playback
    melodyPlayer.play(testMelody, true); // Play with loop
    console.log('🔁 Looping test melody. Type stopMelody() to stop.');
}

// Simple single-note test to isolate clicking issue
function simpleTest() {
    // Initialize audio if needed
    if (!audioInitialized) {
        tryInitAudio();
    }

    console.log('🎵 Simple test: Single note repeated every 1 second');
    console.log('Watch for clicks. Press stopMelody() to stop.');
    
    const testMelody = {
        steps: 8,
        notes: [
            { step: 0, pitch: 0 },  // C
            { step: 4, pitch: 0 },  // C again
        ]
    };

    melodyPlayer.stop();
    melodyPlayer.play(testMelody, true);
}

// Add to window for console testing
(window as any).testMelody = testMelodyPlayback;
(window as any).quickTest = quickTest;
(window as any).simpleTest = simpleTest;
(window as any).stopMelody = () => melodyPlayer.stop();
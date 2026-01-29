import { connectToServer, onMessage, onOpen } from './network/socket';
import { handleServerMessage } from './network/handlers';
import { onStateChange } from './game/gameState';
import { initAudioContext } from './audio/audioContext';
import { initPlayback, playNoteName, stopNote, midiToFrequency, noteNameToMidi } from './audio/playback';
import { MelodyGrid } from './melody/grid';
import { MelodyPlayer } from './melody/player';

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

// React to state changes
onStateChange((state) => {
    console.log('🎯 Phase changed to:', state.phase);
    console.log('👥 Players:', state.players.length);

    // Show/hide phase containers based on current phase
    showPhaseContainer(state.phase);
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

// Initialize grid
const grid = new MelodyGrid('creation-container');

// Initialize melody player
const melodyPlayer = new MelodyPlayer(120); // 120 BPM

// Test playing a melody
function testMelodyPlayback() {
    const melody = grid.serialize();

    if (melody.notes.length === 0) {
        console.log('⚠️  Grid is empty, add some notes first!');
        return;
    }

    melodyPlayer.play(melody, true); // Play with loop
}

// Add to window for console testing
(window as any).testMelody = testMelodyPlayback;
(window as any).stopMelody = () => melodyPlayer.stop();
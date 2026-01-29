import { connectToServer, onMessage, onOpen } from './network/socket';
import { handleServerMessage } from './network/handlers';
import { onStateChange } from './game/gameState';
import { initAudioContext } from './audio/audioContext';
import { Synth } from './audio/synth';
import { initPlayback, playNoteName, playMidiNote, stopNote, midiToFrequency, noteNameToMidi } from './audio/playback';

console.log('🎮 Discover - Starting...');

// Initialize audio on first user interaction
let audioInitialized = false;

function tryInitAudio() {
    if (audioInitialized) return;

    try {
        initAudioContext();
        audioInitialized = true;
        console.log('🔊 Audio is ready!');

        // Remove the click listener once initialized
        document.removeEventListener('click', tryInitAudio);

        // TEST: Create a synth and play a note
        testSynth();
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

    // TODO: Update UI based on phase
    // We'll implement this in the next tasks
});

// Connect to server
connectToServer('ws://localhost:3000');
import { sendMessage } from '../network/socket';
import { MelodyGrid } from '../melody/grid';
import { MelodyPlayer } from '../melody/player';
import { SynthSettings, Waveform } from '../../../shared/index';
import { playMidiNote, stopNoteById, updateSynthSettings } from '../audio/playback';
import { updateTimerDisplay } from '../game/timer';

// Current synth settings (will be modified by UI controls)
let currentSynthSettings: SynthSettings = {
    waveform: 'sine',
    volume: 0.5,
    adsr: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3
    }
};

// References to grid and player
let melodyGrid: MelodyGrid;
let melodyPlayer: MelodyPlayer;
let isLooping = false;
let loopTimeoutId: number | null = null; // Track timeout for cancellation
let isLocked = false; // Track if creation is locked after submission

// Initialize the creation UI
export function initCreation(): { grid: MelodyGrid; player: MelodyPlayer } {
    const container = document.getElementById('creation-container');
    if (!container) {
        throw new Error('Creation container not found');
    }

    // Build the complete UI structure
    container.innerHTML = `
        <h2>Create Your Track</h2>
        
        <div class="creation-layout">
            <div class="synth-controls-panel">
                <h3>Synth Controls</h3>
                <div id="synth-controls"></div>
                <button id="test-note-btn">🔊 Test Note</button>
            </div>
            
            <div class="melody-panel">
                <h3>Melody Grid</h3>
                <div id="grid-container"></div>
            </div>
            
            <div class="controls-panel">
                <div class="playback-controls">
                    <button id="play-loop-btn">▶ Play Loop</button>
                    <button id="stop-loop-btn" disabled>⏹ Stop</button>
                    <span id="loop-indicator"></span>
                </div>
                
                <button id="submit-track-btn" class="submit-btn">✓ Submit Track</button>
                
                <div id="timer-container">
                    <div id="timer-display">05:00</div>
                    <div id="timer-status">Time Remaining</div>
                </div>
            </div>
        </div>
    `;

    // NOW create the grid (pointing to the grid-container we just created)
    melodyGrid = new MelodyGrid('grid-container');
    
    // Create the melody player
    melodyPlayer = new MelodyPlayer(120);

    // Build synth controls
    buildSynthControls();

    // Attach event listeners
    attachEventListeners();

    console.log('🎨 Creation UI initialized');
    
    // Return grid and player for external use
    return { grid: melodyGrid, player: melodyPlayer };
}

// Build the synth control sliders and dropdowns
function buildSynthControls(): void {
    const controlsContainer = document.getElementById('synth-controls');
    if (!controlsContainer) return;

    controlsContainer.innerHTML = `
        <div class="control-group">
            <label for="waveform-select">Waveform:</label>
            <select id="waveform-select">
                <option value="sine">Sine</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
            </select>
        </div>

        <div class="control-group">
            <label for="volume-slider">Volume: <span id="volume-value">50%</span></label>
            <input type="range" id="volume-slider" min="0" max="100" value="50">
        </div>

        <div class="control-group">
            <label for="attack-slider">Attack: <span id="attack-value">0.1s</span></label>
            <input type="range" id="attack-slider" min="0" max="100" value="10">
        </div>

        <div class="control-group">
            <label for="decay-slider">Decay: <span id="decay-value">0.2s</span></label>
            <input type="range" id="decay-slider" min="0" max="100" value="20">
        </div>

        <div class="control-group">
            <label for="sustain-slider">Sustain: <span id="sustain-value">0.7</span></label>
            <input type="range" id="sustain-slider" min="0" max="100" value="70">
        </div>

        <div class="control-group">
            <label for="release-slider">Release: <span id="release-value">0.3s</span></label>
            <input type="range" id="release-slider" min="0" max="100" value="30">
        </div>
    `;
}

// Attach event listeners to all controls
function attachEventListeners(): void {
    // Waveform dropdown
    const waveformSelect = document.getElementById('waveform-select') as HTMLSelectElement;
    waveformSelect?.addEventListener('change', (e) => {
        if (isLocked) return; // Don't allow changes when locked
        
        currentSynthSettings.waveform = (e.target as HTMLSelectElement).value as Waveform;
        console.log('🎵 Waveform changed to:', currentSynthSettings.waveform);
        
        // Update synth immediately so waveform change takes effect
        updateSynthSettings(currentSynthSettings);
    });

    // Setup all sliders with a helper function
    setupSlider('volume', 0, 100, (value) => {
        currentSynthSettings.volume = value / 100;
        return `${value}%`;
    });

    setupSlider('attack', 0, 100, (value) => {
        currentSynthSettings.adsr.attack = value / 100;
        return `${(value / 100).toFixed(2)}s`;
    });

    setupSlider('decay', 0, 100, (value) => {
        currentSynthSettings.adsr.decay = value / 100;
        return `${(value / 100).toFixed(2)}s`;
    });

    setupSlider('sustain', 0, 100, (value) => {
        currentSynthSettings.adsr.sustain = value / 100;
        return (value / 100).toFixed(2);
    });

    setupSlider('release', 0, 100, (value) => {
        currentSynthSettings.adsr.release = value / 100;
        return `${(value / 100).toFixed(2)}s`;
    });

    // Test note button
    const testBtn = document.getElementById('test-note-btn');
    testBtn?.addEventListener('click', handleTestNote);

    // Play loop button
    const playBtn = document.getElementById('play-loop-btn');
    playBtn?.addEventListener('click', handlePlayLoop);

    // Stop loop button
    const stopBtn = document.getElementById('stop-loop-btn');
    stopBtn?.addEventListener('click', handleStopLoop);

    // Submit button
    const submitBtn = document.getElementById('submit-track-btn');
    submitBtn?.addEventListener('click', handleSubmitTrack);
}

// Helper function to setup a slider with automatic display update
function setupSlider(
    name: string,
    min: number,
    max: number,
    onChange: (value: number) => string
): void {
    const slider = document.getElementById(`${name}-slider`) as HTMLInputElement;
    slider?.addEventListener('input', (e) => {
        if (isLocked) {
            // Reset slider to current value when locked
            (e.target as HTMLInputElement).value = slider.dataset.currentValue || '50';
            return;
        }
        
        const value = parseInt((e.target as HTMLInputElement).value);
        slider.dataset.currentValue = value.toString(); // Store current value
        const displayValue = onChange(value);
        updateDisplay(`${name}-value`, displayValue);
        
        // Update synth with new settings (won't recreate oscillators, just updates params)
        updateSynthSettings(currentSynthSettings);
    });
}

// Helper to update display values
function updateDisplay(elementId: string, value: string): void {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Test a single note with current synth settings
function handleTestNote(): void {
    console.log('🎵 Testing note with settings:', currentSynthSettings);

    // Update synth to use current settings
    updateSynthSettings(currentSynthSettings);

    // Play middle C (MIDI 60) for 500ms
    const noteId = playMidiNote(60);

    // Stop after 500ms
    setTimeout(() => {
        stopNoteById(noteId);
    }, 500);
}

// Start looping the melody
function handlePlayLoop(): void {
    if (isLooping) return; // Already playing

    console.log('▶ Starting loop');
    isLooping = true;

    // Update synth settings before playing
    updateSynthSettings(currentSynthSettings);

    // Update button states
    const playBtn = document.getElementById('play-loop-btn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stop-loop-btn') as HTMLButtonElement;
    if (playBtn) playBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;

    // Start the loop
    playLoopIteration();
}

// Play one iteration of the loop
function playLoopIteration(): void {
    if (!isLooping) return;

    // Get current melody from grid (includes any changes made during loop!)
    const melody = melodyGrid.serialize();

    if (melody.notes.length === 0) {
        console.log('⚠️  Grid is empty');
        handleStopLoop();
        return;
    }

    // Update synth settings in case they changed
    updateSynthSettings(currentSynthSettings);

    // Play the melody (not looping in player, we handle loop ourselves)
    melodyPlayer.play(melody, false);

    // Calculate melody duration using the same function
    const melodyDuration = calculateMelodyDuration(melody.steps);
    
    // Schedule next iteration
    loopTimeoutId = window.setTimeout(() => {
        if (isLooping) {
            playLoopIteration(); // Recursive loop!
        }
    }, melodyDuration);
}

// Calculate melody duration in milliseconds
function calculateMelodyDuration(steps: number): number {
    // Use the same BPM as the melody player
    const bpm = melodyPlayer.getBPM();
    
    // Same formula as MelodyPlayer.calculateStepDuration()
    // 16 steps per bar, 4 beats per bar = 4 steps per beat
    const secondsPerBeat = 60 / bpm;
    const stepsPerBeat = 4;
    const secondsPerStep = secondsPerBeat / stepsPerBeat;
    const millisecondsPerStep = secondsPerStep * 1000;
    
    return steps * millisecondsPerStep;
}

// Stop looping
function handleStopLoop(): void {
    console.log('⏹ Stopping loop');
    isLooping = false;

    // Cancel scheduled next iteration
    if (loopTimeoutId !== null) {
        clearTimeout(loopTimeoutId);
        loopTimeoutId = null;
    }

    // Stop current playback
    melodyPlayer.stop();

    // Update button states
    const playBtn = document.getElementById('play-loop-btn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stop-loop-btn') as HTMLButtonElement;
    if (playBtn) playBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;

    // Clear indicator
    updateDisplay('loop-indicator', '');
}

// Submit the track to the server
function handleSubmitTrack(): void {
    console.log('📤 Submitting track');

    // Stop any playing loop
    if (isLooping) {
        handleStopLoop();
    }

    // Get current melody
    const melody = melodyGrid.serialize();

    // Validate: must have at least one note
    if (melody.notes.length === 0) {
        alert('Cannot submit empty track! Add some notes first.');
        return;
    }

    // Create track object
    // Server will fill in id and ownerPlayerId
    const track = {
        id: '', // Server assigns
        ownerPlayerId: '', // Server assigns
        synthSettings: currentSynthSettings,
        melody: melody
    };

    console.log('🎵 Track data:', {
        noteCount: melody.notes.length,
        steps: melody.steps,
        waveform: currentSynthSettings.waveform,
        volume: currentSynthSettings.volume
    });

    // Send to server
    sendMessage({
        type: 'SUBMIT_TRACK',
        track: track
    });

    // Disable submit button to prevent double submission
    const submitBtn = document.getElementById('submit-track-btn') as HTMLButtonElement;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '✓ Track Submitted';
    }
    
    // Lock the grid and controls
    isLocked = true;
    melodyGrid.setLocked(true);
    
    // Disable all synth controls visually
    const synthControls = document.getElementById('synth-controls');
    if (synthControls) {
        synthControls.style.opacity = '0.6';
        synthControls.style.pointerEvents = 'none';
    }

    // Show confirmation
    alert('🎵 Track submitted! You can still listen to your loop.');
}

// Update timer based on game state
export function updateCreationTimer(timeRemaining: number): void {
    updateTimerDisplay(timeRemaining, isLocked);

    // Auto-submit at 0 if not already submitted
    if (timeRemaining <= 0 && !isLocked) {
        console.log('⏰ Time expired! Auto-submitting...');
        handleAutoSubmit();
    }
}

// Auto-submit when timer expires
function handleAutoSubmit(): void {
    const melody = melodyGrid.serialize();

    // If grid is empty, create default melody (one note)
    if (melody.notes.length === 0) {
        console.log('⚠️ Grid empty, creating default melody');

        const defaultMelody = {
            notes: [{ step: 0, pitch: 0 }],
            steps: 16
        };
        melodyGrid.loadMelody(defaultMelody);
    }

    // Submit the track
    handleSubmitTrack();
}

// Reset creation UI for a new round
export function resetCreationUI(): void {
    console.log('🔄 Resetting creation UI');

    // Reset locked state
    isLocked = false;

    // Unlock and clear the grid
    melodyGrid.setLocked(false);
    melodyGrid.clear();

    // Reset synth settings to defaults
    currentSynthSettings = {
        waveform: 'sine',
        volume: 0.5,
        adsr: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.7,
            release: 0.3
        }
    };

    // Update synth with default settings
    updateSynthSettings(currentSynthSettings);

    // Reset all UI controls to default values
    const waveformSelect = document.getElementById('waveform-select') as HTMLSelectElement;
    if (waveformSelect) waveformSelect.value = 'sine';

    const sliders = [
        { id: 'volume-slider', value: 50, displayId: 'volume-value', displayValue: '50%' },
        { id: 'attack-slider', value: 10, displayId: 'attack-value', displayValue: '0.1s' },
        { id: 'decay-slider', value: 20, displayId: 'decay-value', displayValue: '0.2s' },
        { id: 'sustain-slider', value: 70, displayId: 'sustain-value', displayValue: '0.7' },
        { id: 'release-slider', value: 30, displayId: 'release-value', displayValue: '0.3s' }
    ];

    sliders.forEach(sliderInfo => {
        const slider = document.getElementById(sliderInfo.id) as HTMLInputElement;
        if (slider) {
            slider.value = sliderInfo.value.toString();
            updateDisplay(sliderInfo.displayId, sliderInfo.displayValue);
        }
    });

    // Re-enable synth controls
    const synthControls = document.getElementById('synth-controls');
    if (synthControls) {
        synthControls.style.opacity = '1';
        synthControls.style.pointerEvents = 'auto';
    }

    // Re-enable and reset submit button
    const submitBtn = document.getElementById('submit-track-btn') as HTMLButtonElement;
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Submit Track';
    }

    // Stop any playing loop
    if (isLooping) {
        handleStopLoop();
    }
}
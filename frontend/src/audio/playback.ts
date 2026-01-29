import { Synth } from './synth';
import { SynthSettings } from '../../../shared/index';

// Global synth instance (could be multiple later)
let globalSynth: Synth | null = null;

// Initialize playback with a synth
export function initPlayback(settings?: SynthSettings): void {
    if (globalSynth) {
        globalSynth.dispose();
    }

    globalSynth = new Synth(settings);
    console.log('🎼 Playback initialized');
}

// Get the global synth
export function getSynth(): Synth {
    if (!globalSynth) {
        throw new Error('Playback not initialized. Call initPlayback() first.');
    }
    return globalSynth;
}

// Convert MIDI note number to frequency
export function midiToFrequency(midiNote: number): number {
    // Formula: f = 440 * 2^((n - 69) / 12)
    // Where n is the MIDI note number
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Convert frequency to MIDI note number (inverse)
export function frequencyToMidi(frequency: number): number {
    // Formula: n = 69 + 12 * log2(f / 440)
    return Math.round(69 + 12 * Math.log2(frequency / 440));
}

// Note name to MIDI number mapping
const noteNameToMidiMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
};

// Parse note name (e.g., "C4", "A#5", "Db3") to MIDI number
export function noteNameToMidi(noteName: string): number {
    // Parse note name like "C4" or "A#5"
    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);

    if (!match) {
        throw new Error(`Invalid note name: ${noteName}`);
    }

    const [, note, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);

    // MIDI number = (octave + 1) * 12 + note offset
    // C-1 = MIDI 0, so C4 = (4 + 1) * 12 + 0 = 60
    const baseNote = noteNameToMidiMap[note];
    if (baseNote === undefined) {
        throw new Error(`Unknown note: ${note}`);
    }

    return (octave + 1) * 12 + baseNote;
}

// Convert MIDI to note name
export function midiToNoteName(midiNote: number): string {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return `${noteNames[noteIndex]}${octave}`;
}

// Play a note by MIDI number
export function playMidiNote(midiNote: number): number {
    const frequency = midiToFrequency(midiNote);
    const synth = getSynth();
    return synth.playNote(frequency);
}

// Play a note by name (e.g., "C4", "A#5")
export function playNoteName(noteName: string): void {
    const midiNote = noteNameToMidi(noteName);
    playMidiNote(midiNote);
}

// Stop the currently playing note
export function stopNote(): void {
    const synth = getSynth();
    synth.stopNote();
}

// Stop note by its ID
export function stopNoteById(noteId: number): void {
    const synth = getSynth();
    synth.stopNoteById(noteId);
}

// Update synth settings
export function updateSynthSettings(settings: SynthSettings): void {
    const synth = getSynth();
    synth.updateSettings(settings);
}

// Check if currently playing
export function isPlaying(): boolean {
    const synth = getSynth();
    return synth.isPlaying();
}
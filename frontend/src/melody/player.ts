import { MelodyData } from '../../../shared/index';
import { playMidiNote, stopNote, stopNoteById } from '../audio/playback';

// Configuration
const DEFAULT_BPM = 120;
const DEFAULT_BASE_MIDI = 60; // Middle C

export class MelodyPlayer {
    private isPlaying: boolean = false;
    private shouldLoop: boolean = false;
    private currentTimeouts: number[] = [];
    private bpm: number;
    private baseMidi: number;

    constructor(bpm: number = DEFAULT_BPM, baseMidi: number = DEFAULT_BASE_MIDI) {
        this.bpm = bpm;
        this.baseMidi = baseMidi;
    }

    // Play a melody
    play(melodyData: MelodyData, loop: boolean = false): void {
        if (this.isPlaying) {
            this.stop(); // Stop current playback first
        }

        this.isPlaying = true;
        this.shouldLoop = loop;

        console.log(`🎵 Playing melody: ${melodyData.notes.length} notes`)

        this.playMelody(melodyData);
    }

    private playMelody(melodyData: MelodyData): void {
        if (!this.isPlaying) return;

        // Calculate timing
        const stepDuration = this.calculateStepDuration();
        const totalDuration = melodyData.steps * stepDuration;

        // Group notes by step for simultaneous playback
        const notesByStep = new Map<number, number[]>();
        melodyData.notes.forEach(note => {
            if (!notesByStep.has(note.step)) {
                notesByStep.set(note.step, []);
            }
            notesByStep.get(note.step)!.push(note.pitch);
        });

        // Schedule all notes
        notesByStep.forEach((pitches, step) => {
            const delay = step * stepDuration;

            const timeoutId = window.setTimeout(() => {
                if (!this.isPlaying) return;

                // Play all notes at this step (chord support!)
                pitches.forEach(pitch => {
                    const midiNote = this.baseMidi + pitch;
                    const noteId = playMidiNote(midiNote);

                    // Stop note before next step
                    const noteLength = stepDuration * 0.8; // 80% of step duration
                    const stopTimeoutId = window.setTimeout(() => {
                        stopNoteById(noteId);
                    }, noteLength);
                    
                    // IMPORTANT: Track this timeout so it gets cleared on stop!
                    this.currentTimeouts.push(stopTimeoutId);
                });

                console.log(`🎹 Step ${step}: playing ${pitches.length} note(s)`)
            }, delay);

            this.currentTimeouts.push(timeoutId);
        });

        // Schedule loop or stop
        const loopTimeoutId = window.setTimeout(() => {
            if (this.shouldLoop && this.isPlaying) {
                console.log('🔁 Looping melody...');
                this.playMelody(melodyData); // Recursive loop
            } else {
                this.isPlaying = false;
                console.log('✅ Melody finished');
            }
        }, totalDuration);

        this.currentTimeouts.push(loopTimeoutId);
    }

    // Stop playback
    stop(): void {
        this.isPlaying = false;
        this.shouldLoop = false;

        // Clear all scheduled timeouts
        this.currentTimeouts.forEach(id => window.clearTimeout(id));
        this.currentTimeouts = [];

        // Stop any playing notes
        stopNote();

        console.log('⏹️ Playback stopped');
    }

    // Check if currently playing
    getIsPlaying(): boolean {
        return this.isPlaying;
    }

    // Set tempo (BPM)
    setBPM(bpm: number): void {
        this.bpm = bpm;
        console.log(`🎼 Tempo set to ${bpm} BPM`);
    }

    // Get current tempo
    getBPM(): number {
        return this.bpm;
    }

    // Calculate duration of one step in milliseconds
    private calculateStepDuration(): number {
        // BPM = beats per minute
        // If we have 16 steps per bar and 4 beats per bar
        // Then each step is 1/4 of a beat
        const beatsPerMinute = this.bpm;
        const minutesPerBeat = 1 / beatsPerMinute;
        const secondsPerBeat = minutesPerBeat * 60;
        const stepsPerBeat = 4; // 16 steps / 4 beats = 4 steps per beat
        const secondsPerStep = secondsPerBeat / stepsPerBeat;
        const millisecondsPerStep = secondsPerStep * 1000;

        return millisecondsPerStep;
    }
}
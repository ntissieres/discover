import { getAudioContext } from './audioContext';
import { SynthSettings, Waveform } from '../../../shared/index';

export class Synth {
    private settings: SynthSettings;
    private activeNotes: Map<number, { oscillator: OscillatorNode; gainNode: GainNode }>;
    private masterGain: GainNode;

    constructor(settings?: SynthSettings) {
        // Default settings if none provided
        this.settings = settings || {
            waveform: 'sine',
            volume: 0.3,
            adsr: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.7,
                release: 0.3
            }
        };

        // Track multiple active notes
        this.activeNotes = new Map();

        // Create the master gain node (connects to speakers)
        const ctx = getAudioContext();
        this.masterGain = ctx.createGain();
        this.masterGain.connect(ctx.destination);
        this.masterGain.gain.value = 1; // Master volume at 100%
    }

    // Update synthesizer settings
    updateSettings(settings: SynthSettings): void {
        this.settings = settings;
        console.log('🎛️ Synth settings updated:', settings);
    }

    // Get current settings
    getSettings(): SynthSettings {
        return { ...this.settings };
    }

    // Play a note at a given frequency
    playNote(frequency: number): void {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        // Create NEW gain node for this note
        const gainNode = ctx.createGain();
        gainNode.connect(this.masterGain);
        
        // Create oscillator (sound source)
        const oscillator = ctx.createOscillator();
        oscillator.type = this.settings.waveform;
        oscillator.frequency.value = frequency;

        // Connect oscillator to its own gain node
        oscillator.connect(gainNode);

        // Apply ADSR envelope to gain
        const { attack, decay, sustain } = this.settings.adsr;
        const targetVolume = this.settings.volume;

        // Attack: Ramp up to full volume
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(targetVolume, now + attack);

        // Decay: Ramp down to sustain level
        gainNode.gain.linearRampToValueAtTime(
            targetVolume * sustain,
            now + attack + decay
        );

        // Start the oscillator
        oscillator.start(now);

        // Store in active notes map (use frequency as key)
        this.activeNotes.set(frequency, { oscillator, gainNode });

        console.log(`🎵 Playing note: ${frequency.toFixed(2)} Hz (${this.settings.waveform}) [${this.activeNotes.size} active]`);
    }

    // Stop the currently playing note
    stopNote(): void {
        if (this.activeNotes.size === 0) {
            return; // No notes playing
        }

        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const { release } = this.settings.adsr;

        // Stop all active notes
        this.activeNotes.forEach(({ oscillator, gainNode }, frequency) => {
            // Release: Fade out
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + release);

            // Stop oscillator after release
            oscillator.stop(now + release);

            // Cleanup
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            }
        });

        // Clear all active notes
        this.activeNotes.clear();

        console.log('🔇 All notes stopped');
    }

    // Check if currently playing
    isPlaying(): boolean {
        return this.activeNotes.size > 0;
    }

    // Cleanup resources
    dispose(): void {
        this.stopNote();
        this.masterGain.disconnect();
    }
}

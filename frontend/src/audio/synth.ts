import { getAudioContext } from './audioContext';
import { SynthSettings, Waveform } from '../../../shared/index';

export class Synth {
    private settings: SynthSettings;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
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
        // Stop any currently playing note
        this.stopNote();

        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        // Create NEW gain node for this note (avoids scheduling conflicts)
        this.gainNode = ctx.createGain();
        this.gainNode.connect(this.masterGain);
        
        // Create oscillator (sound source)
        this.oscillator = ctx.createOscillator();
        this.oscillator.type = this.settings.waveform;
        this.oscillator.frequency.value = frequency;

        // Connect oscillator to its own gain node
        this.oscillator.connect(this.gainNode);

        // Apply ADSR envelope to gain
        const { attack, decay, sustain } = this.settings.adsr;
        const targetVolume = this.settings.volume;

        // Attack: Ramp up to full volume
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(targetVolume, now + attack);

        // Decay: Ramp down to sustain level
        this.gainNode.gain.linearRampToValueAtTime(
            targetVolume * sustain,
            now + attack + decay
        );

        // Start the oscillator
        this.oscillator.start(now);

        console.log(`🎵 Playing note: ${frequency.toFixed(2)} Hz (${this.settings.waveform})`);
    }

    // Stop the currently playing note
    stopNote(): void {
        if (!this.oscillator || !this.gainNode) {
            return; // No note playing
        }

        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const { release } = this.settings.adsr;

        // Release: Fade out
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + release);

        // Stop oscillator after release
        this.oscillator.stop(now + release);

        // Cleanup
        const osc = this.oscillator;
        const gain = this.gainNode;
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        }

        this.oscillator = null;
        this.gainNode = null;

        console.log('🔇 Note stopped');
    }

    // Check if currently playing
    isPlaying(): boolean {
        return this.oscillator !== null;
    }

    // Cleanup resources
    dispose(): void {
        this.stopNote();
        this.masterGain.disconnect();
    }
}


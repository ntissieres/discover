import { getAudioContext } from './audioContext';
import { SynthSettings } from '../../../shared/index';

// Voice represents a reusable oscillator + gain node pair
interface Voice {
    oscillator: OscillatorNode;
    gainNode: GainNode;
    isActive: boolean;
}

export class Synth {
    private settings: SynthSettings;
    private voices: Voice[] = [];
    private maxPolyphony: number = 16;
    private activeNotes: Map<number, Voice>;
    private masterGain: GainNode;
    private nextNoteId: number = 0;

    constructor(settings?: SynthSettings) {
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

        this.activeNotes = new Map();

        const ctx = getAudioContext();
        this.masterGain = ctx.createGain();
        this.masterGain.connect(ctx.destination);
        this.masterGain.gain.value = 1;

        this.initVoicePool();
    }

    private initVoicePool(): void {
        const ctx = getAudioContext();
        
        console.log(`🎹 Creating voice pool with waveform: ${this.settings.waveform}`);
        
        for (let i = 0; i < this.maxPolyphony; i++) {
            const gainNode = ctx.createGain();
            gainNode.gain.value = 0;
            gainNode.connect(this.masterGain);

            const oscillator = ctx.createOscillator();
            oscillator.type = this.settings.waveform;
            oscillator.frequency.value = 440;
            oscillator.connect(gainNode);
            oscillator.start();

            this.voices.push({ oscillator, gainNode, isActive: false });
        }

        console.log(`🎹 Voice pool created: ${this.maxPolyphony} voices with ${this.settings.waveform} waveform`);
    }

    private getAvailableVoice(): Voice | null {
        return this.voices.find(v => !v.isActive) || null;
    }

    updateSettings(settings: SynthSettings): void {
        const oldWaveform = this.settings.waveform;
        
        // Make a copy to avoid reference issues
        this.settings = {
            waveform: settings.waveform,
            volume: settings.volume,
            adsr: {
                attack: settings.adsr.attack,
                decay: settings.adsr.decay,
                sustain: settings.adsr.sustain,
                release: settings.adsr.release
            }
        };
        
        // If waveform changed, recreate oscillators
        if (oldWaveform !== this.settings.waveform) {
            console.log(`🎛️ Waveform changed: ${oldWaveform} → ${this.settings.waveform}, recreating oscillators`);
            this.recreateVoicePool();
        } else {
            console.log('🎛️ Synth settings updated');
        }
    }

    private recreateVoicePool(): void {
        const ctx = getAudioContext();
        
        // Stop and disconnect old oscillators
        this.voices.forEach(voice => {
            voice.oscillator.stop();
            voice.oscillator.disconnect();
            voice.gainNode.disconnect();
        });
        
        // Clear voice pool
        this.voices = [];
        this.activeNotes.clear();
        
        // Recreate voice pool with new waveform
        this.initVoicePool();
    }

    getSettings(): SynthSettings {
        return { ...this.settings };
    }

    playNote(frequency: number): number {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        const voice = this.getAvailableVoice();
        if (!voice) {
            console.warn('⚠️ Max polyphony reached');
            return -1;
        }

        const noteId = this.nextNoteId++;
        voice.isActive = true;

        voice.oscillator.frequency.setValueAtTime(frequency, now);

        const { attack, decay, sustain } = this.settings.adsr;
        const targetVolume = this.settings.volume;

        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(0, now);
        voice.gainNode.gain.linearRampToValueAtTime(targetVolume, now + attack);
        voice.gainNode.gain.linearRampToValueAtTime(
            targetVolume * sustain,
            now + attack + decay
        );

        this.activeNotes.set(noteId, voice);

        console.log(`🎵 Note ${noteId}: ${frequency.toFixed(2)} Hz`);
        
        return noteId;
    }

    stopNote(): void {
        if (this.activeNotes.size === 0) return;

        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const { release } = this.settings.adsr;

        this.activeNotes.forEach((voice) => {
            voice.gainNode.gain.cancelScheduledValues(now);
            voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
            voice.gainNode.gain.linearRampToValueAtTime(0, now + release);

            setTimeout(() => {
                voice.isActive = false;
            }, release * 1000 + 10);
        });

        this.activeNotes.clear();
        console.log('🔇 All stopped');
    }

    stopNoteById(noteId: number): void {
        const voice = this.activeNotes.get(noteId);
        if (!voice) return;

        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const { release } = this.settings.adsr;

        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
        voice.gainNode.gain.linearRampToValueAtTime(0, now + release);

        setTimeout(() => {
            voice.isActive = false;
        }, release * 1000 + 10);

        this.activeNotes.delete(noteId);
        console.log(`🔇 Note ${noteId} stopped`);
    }

    isPlaying(): boolean {
        return this.activeNotes.size > 0;
    }

    dispose(): void {
        this.stopNote();
        this.masterGain.disconnect();
    }
}

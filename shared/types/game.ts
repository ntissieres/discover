import { GamePhase } from "./phases";
import { Player } from "./player";
import { Track } from "./track";

export interface ADSR {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
}

export type Waveform = "sine" | "sawtooth" | "square";

export interface SynthSettings {
    waveform: Waveform;
    volume: number;
    adsr: ADSR;
}

export interface MelodyNote {
    pitch: number;
    step: number;
}

export interface MelodyData {
    notes: MelodyNote[];
    steps: number;
}

export interface GameState {
    phase: GamePhase;
    roundTimeRemaining: number;
    players: Player[];
    tracks: Track[];
    selections: { [playerId: string]: string };
}
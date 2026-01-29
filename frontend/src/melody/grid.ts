import { serializeGrid } from './serializer';
import { MelodyData } from '../../../shared/index';

// Grid configuration
const GRID_STEPS = 16; //16 time steps (beats)
const GRID_PITCHES = 12; // 12 pitches (1 octave: C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
const BASE_MIDI = 60; // Start at C4 (middle C)

// Note: grid position [step, pitch]
type GridPosition = [number, number];

export class MelodyGrid {
    private container: HTMLElement;
    private gridElement: HTMLDivElement;
    private activeNotes: Set<string>; // Store as "step,pitch" strings

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`)
        }
        this.container = container;
        this.activeNotes = new Set();

        // Create grid element
        this.gridElement = document.createElement('div');
        this.gridElement.className = 'melody-grid';

        this.buildGrid();
        this.container.appendChild(this.gridElement);
    }

    private buildGrid(): void {
        // Create grid cells (pitches go top to bottom, steps go left to right)
        for (let pitch = GRID_PITCHES - 1; pitch >= 0; pitch--) {
            for (let step = 0; step < GRID_STEPS; step++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.step = step.toString();
                cell.dataset.pitch = pitch.toString();

                // Click handler to toggle note
                cell.addEventListener('click', () => {
                    this.toggleNote(step, pitch);
                });

                this.gridElement.appendChild(cell);
            }
        }
    }

    private toggleNote(step: number, pitch: number): void {
        const key = `${step},${pitch}`;

        if (this.activeNotes.has(key)) {
            // Remove note
            this.activeNotes.delete(key);
            this.updateCellVisual(step, pitch, false);
        } else {
            // Add note
            this.activeNotes.add(key);
            this.updateCellVisual(step, pitch, true);
        }

        console.log(`Note ${this.activeNotes.has(key) ? 'added' : 'removed'} at step ${step}, pitch ${pitch}`);
    }

    private updateCellVisual(step: number, pitch: number, active: boolean): void {
        const cell = this.gridElement.querySelector(
            `[data-step="${step}"][data-pitch="${pitch}"]`
        );

        if (cell) {
            if (active) {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        }
    }

    // Get all active notes for serialization
    getActiveNotes(): GridPosition[] {
        return Array.from(this.activeNotes).map(key => {
            const [step, pitch] = key.split(',').map(Number);
            return [step, pitch];
        });
    }

    // Clear the entire grid
    clear(): void {
        this.activeNotes.clear();
        this.gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('active');
        });
    }

    // Convert pitch index to MIDI note number
    pitchToMidi(pitch: number): number {
        return BASE_MIDI + pitch;
    }

    // Serialize current grid state to MelodyData
    serialize(): MelodyData {
        const activeNotes = this.getActiveNotes();
        return serializeGrid(activeNotes, GRID_STEPS);
    }

    // Load melody data into the grid
    loadMelody(melodyData: MelodyData): void {
        // Clear existing notes
        this.clear();

        // Add all notes from the melody
        melodyData.notes.forEach(note => {
            const key = `${note.step},${note.pitch}`;
            this.activeNotes.add(key);
            this.updateCellVisual(note.step, note.pitch, true);
        });

        console.log(`📥 Loaded melody: ${melodyData.notes.length} notes`)
    }
}
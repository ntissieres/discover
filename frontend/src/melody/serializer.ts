import { MelodyData, MelodyNote } from '../../../shared/index';

// Serialize grid state to MelodyData format
// Converts [step, pitch] positions into MelodyNote objects
export function serializeGrid(activeNotes: [number, number][], totalSteps: number): MelodyData {
    // Convert grid positions to MelodyNote objects
    const notes: MelodyNote[] = activeNotes.map(([step, pitch]) => ({
        step,
        pitch
    }));

    // Sort by step, then by pitch (for consistent ordering)
    notes.sort((a, b) => {
        if (a.step !== b.step) {
            return a.step - b.step; // Earlier steps first
        }
        return a.pitch - b.pitch; // Lower pitches first
    });

    return {
        notes,
        steps: totalSteps
    };
}

// Deserialize MelodyData back to grid positions
// Useful for loading saved melodies or displaying other players' tracks
export function deserializeToGrid(melodyData: MelodyData): [number, number][] {
    return melodyData.notes.map(note => [note.step, note.pitch]);
}

// Validate melody data
// Returns true if the melody is valid
export function validateMelody(melodyData: MelodyData): { valid: boolean; error?: string } {
    // Check if melody has notes
    if (melodyData.notes.length === 0) {
        return { valid: false, error: 'Melody must have at least one note'};
    }

    // Check if all notes are within bounds
    for (const note of melodyData.notes) {
        if (note.step < 0 || note.step >= melodyData.steps) {
            return { valid: false, error: `Note step ${note.step} is out of bounds (0-${melodyData.steps - 1})` };
        }

        if (note.pitch < 0 || note.pitch >= 12) {
            return { valid: false, error: `Note pitch ${note.pitch} is out of bounds (0-11)` };
        }
    }

    return { valid: true };
}

// Get a human-readable summary of the melody
export function getMelodySummary(melodyData: MelodyData): string {
    const noteCount = melodyData.notes.length;
    const uniqueSteps = new Set(melodyData.notes.map(n => n.step)).size;

    return `${noteCount} note${noteCount !== 1 ? 's' : ''} across ${uniqueSteps} step${uniqueSteps !== 1 ? 's' : ''}`;
}
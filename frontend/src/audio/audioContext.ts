// Singleton AudioContext instance
let audioContext: AudioContext | null = null;

// Initialize the audio context (must be called after user interaction)
export function initAudioContext (): AudioContext {
    if (audioContext) {
        // Already initialized
        return audioContext;
    }

    console.log('🎵 Initializing Audio Context...');

    // Create the audio context
    audioContext = new AudioContext();

    // Check if it's suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        console.log('⏸️  Audio Context is suspended, resuming...');
        audioContext.resume();
    }

    console.log('✅ Audio Context initialized:', audioContext.state);

    return audioContext;
}

// Get the audio context (throws if not initialized)
export function getAudioContext(): AudioContext {
    if (!audioContext) {
        throw new Error('AudioContext not initialized. Call initAudioContext() first after user interaction.');
    }

    return audioContext;
}

// Check if audio is ready
export function isAudioReady(): boolean {
    return audioContext !== null && audioContext.state === 'running';
}

// Get sample rate (useful for audio calculations)
export function getSampleRate(): number {
    if (!audioContext) {
        throw new Error('AudioContext not initialized.');
    }
    return audioContext.sampleRate;
}

// Get current time (for scheduling audio events)
export function getCurrentTime(): number {
    if (!audioContext) {
        throw new Error('AudioContext not initialized.');
    }
    return audioContext.currentTime;
}
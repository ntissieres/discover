// Format seconds to MM:SS
export function formatTime(seconds: number): string {
    // Ensure non-negative
    const totalSeconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Pad with zeros
    const mm = minutes.toString().padStart(2, '0');
    const ss = remainingSeconds.toString().padStart(2, '0');

    return `${mm}:${ss}`;
}

// Get color class based on time remaining
export function getTimerColorClass(seconds: number): string {
    if (seconds <= 10) return 'critical';
    if (seconds <= 30) return 'warning';
    return 'normal';
}

// Update the timer display
export function updateTimerDisplay(seconds: number, hasSubmitted: boolean): void {
    const displayElement = document.getElementById('timer-display');
    const statusElement = document.getElementById('timer-status');

    if (!displayElement || !statusElement) return;

    // Format and show time
    displayElement.textContent = formatTime(seconds);

    // Update color
    displayElement.className = getTimerColorClass(seconds);

    // Update status message
    if (hasSubmitted) {
        statusElement.textContent = 'Waiting for others...';
        statusElement.style.color = '#4a9eff';
    } else {
        statusElement.textContent = 'Time Remaining';
        statusElement.style.color = '#999';
    }
}
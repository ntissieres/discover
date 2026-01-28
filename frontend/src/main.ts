import { connectToServer, onMessage, onOpen, sendMessage } from './network/socket';
import { handleServerMessage } from './network/handlers';
import { onStateChange, getCurrentPhase } from './game/gameState';

console.log('🎮 Discover - Starting...');

// Handle connection opened
onOpen(() => {
    console.log('✅ Connected. Ready to play!');
});

// Route all messages through handler
onMessage((message) => {
    handleServerMessage(message);
});

// React to state changes
onStateChange((state) => {
    console.log('🎯 Phase changed to:', state.phase);
    console.log('👥 Players:', state.players.length);

    // TODO: Update UI based on phase
    // We'll implement this in the next tasks
});

// Connect to server
connectToServer('ws://localhost:3000');
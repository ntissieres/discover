import express from 'express';
import cors from 'cors';
import { initializeWebSocketServer, broadcast } from './socketServer';
import { getGameState, addPlayer, getPlayerCount } from './game/gameState'

// Create Express application instance
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Discover backend is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/game-state', (req, res) => {
    res.json(getGameState());
});

// Testing routes
app.post('/test-broadcast', (req, res) => {
    broadcast({
        type: 'TEST_BROADCAST',
        message: 'This is a test broadcast!',
        timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Broadcast sent' });
});

app.post('/test-add-player', (req, res) => {
    addPlayer({
        id: `player-${Date.now()}`,
        name: req.body.name || 'Test Player',
        points: 0,
        connected: true
    });
    
    res.json({
        success: true,
        playerCount: getPlayerCount(),
        gameState: getGameState()
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// Initialize WebSocket server
initializeWebSocketServer(server);

// Export for WebSocket attachment
export { server, app };
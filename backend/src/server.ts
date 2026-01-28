import express from 'express';
import cors from 'cors';
import { initializeWebSocketServer, broadcast } from './socketServer';

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

app.post('/test-broadcast', (req, res) => {
    broadcast({
        type: 'TEST_BROADCAST',
        message: 'This is a test broadcast!',
        timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Broadcast sent' });
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
import { ClientToServerMessage, ServerToClientMessage } from '../../../shared/index';

// WebSocket connection instance
let socket: WebSocket | null = null;

// Callbacks for different events
type MessageHandler = (message: ServerToClientMessage) => void;
type ConnectionHandler = () => void;

let onMessageCallback: MessageHandler | null = null;
let onOpenCallback: ConnectionHandler | null = null;
let onCloseCallback: ConnectionHandler | null = null;

// Initialize WebSocket connection
export function connectToServer(url: string = 'ws://localhost:3000'): void {
    if (socket) {
        console.warn('WebSocket already connected');
        return;
    }

    console.log(`🔌 Connecting to server...`);
    socket = new WebSocket(url);

    // Connection opened
    socket.onopen = () => {
        console.log('✅ Connected to server');
        if (onOpenCallback) onOpenCallback();
    };

    // Message received from server
    socket.onmessage = (event: MessageEvent) => {
        try {
            const message: ServerToClientMessage = JSON.parse(event.data);
            console.log('📨 Received:', message);

            if (onMessageCallback) onMessageCallback(message);
        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    };

    // Connection closed
    socket.onclose = (event: CloseEvent) => {
        console.log('👋 Disconnected from server', event.code, event.reason);
        socket = null;

        if (onCloseCallback) onCloseCallback();
    };

    // Connection error
    socket.onerror = (error: Event) => {
        console.error('❌ WebSocket error:', error);
    };
}

// Send message to server
export function sendMessage(message: ClientToServerMessage): void {
    if (!socket) {
        console.error('❌ WebSocket not connected');
        return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket not ready');
        return;
    }

    console.log('📤 Sending:', message);
    socket.send(JSON.stringify(message));
}

// Register callback for incoming messages
export function onMessage(callback: MessageHandler): void {
    onMessageCallback = callback;
}

// Register callback for connection open
export function onOpen(callback: ConnectionHandler): void {
    onOpenCallback = callback;
}

// Register callback for connection close
export function onClose(callback: ConnectionHandler): void {
    onCloseCallback = callback;
}

// Disconnect from server
export function disconnect(): void {
    if (socket) {
        socket.close();
        socket = null;
    }
}

// Check if connected
export function isConnected(): boolean {
    return socket !== null && socket.readyState === WebSocket.OPEN;
}
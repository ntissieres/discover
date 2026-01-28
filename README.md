# discover
Teach music production through competitive gameplay

music-game/
│
├── package.json
├── tsconfig.json
├── README.md
│
├── shared/
│   ├── index.ts
│   ├── types/
│   │   ├── player.ts
│   │   ├── track.ts
│   │   ├── game.ts
│   │   ├── phases.ts
│   │   └── messages.ts
│   │
│   └── constants/
│       ├── gameRules.ts
│       └── audio.ts
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── app.ts
│       │
│       ├── audio/
│       │   ├── audioContext.ts
│       │   ├── synth.ts
│       │   └── playback.ts
│       │
│       ├── game/
│       │   ├── gameState.ts
│       │   ├── phaseManager.ts
│       │   └── timer.ts
│       │
│       ├── ui/
│       │   ├── lobby.ts
│       │   ├── creation.ts
│       │   ├── listening.ts
│       │   ├── selection.ts
│       │   └── results.ts
│       │
│       ├── melody/
│       │   ├── grid.ts
│       │   ├── serializer.ts
│       │   └── player.ts
│       │
│       ├── network/
│       │   ├── socket.ts
│       │   └── handlers.ts
│       │
│       └── styles/
│           └── main.css
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── socketServer.ts
│       │
│       ├── game/
│       │   ├── gameState.ts
│       │   ├── lobby.ts
│       │   ├── phases.ts
│       │   └── scoring.ts
│       │
│       ├── handlers/
│       │   ├── connection.ts
│       │   ├── trackSubmission.ts
│       │   └── selection.ts
│       │
│       └── utils/
│           └── logger.ts

join a game :
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (e) => console.log('Tab 1:', JSON.parse(e.data));
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'JOIN_GAME',
        playerName: 'Alice'
    }));
};

start a game:
ws.send(JSON.stringify({ type: 'START_GAME' }));
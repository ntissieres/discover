import { sendMessage } from '../network/socket';
import { getGameState, getLocalPlayerId } from '../game/gameState';
import { setWaitingForJoin } from '../network/handlers';
import { GAME_RULES } from '../../../shared/constants/gameRules';

export function initLobby(containerId: string = 'lobby-container'): void {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Lobby container #${containerId} not found`);
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create join form
    const joinForm = createJoinForm();
    container.appendChild(joinForm);

    // Create player list section
    const playerSection = document.createElement('div');
    playerSection.id = 'player-list-section';
    playerSection.innerHTML = `
        <h3>Players <span id="player-count">(0/4)</span></h3>
        <ul id="player-list"></ul>
    `;
    container.appendChild(playerSection);

    // Create start button (initially hidden)
    const startButton = document.createElement('button');
    startButton.id = 'start-button';
    startButton.textContent = 'Start Game';
    startButton.style.display = 'none';
    startButton.onclick = handleStartGame;
    container.appendChild(startButton);

    console.log('🎮 Lobby UI initialized');
}

// Create the join form
function createJoinForm(): HTMLFormElement {
    const form = document.createElement('form');
    form.id = 'join-form';

    const title = document.createElement('h2');
    title.textContent = 'Join Game';
    form.appendChild(title);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'player-name-input';
    input.placeholder = 'Enter your name';
    input.maxLength = 20;
    input.required = true;
    form.appendChild(input);

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Join';
    form.appendChild(button);

    form.onsubmit = handleJoinGame;

    return form;
}

// Handle join form submission
function handleJoinGame(event: Event): void {
    event.preventDefault();

    const input = document.getElementById('player-name-input') as HTMLInputElement;
    const playerName = input.value.trim();

    // If name is empty
    if (!playerName) {
        alert('Please enter a name');
        return;
    }

    // Send JOIN_GAME message to server
    // Let the server validate (duplicate names, full lobby, etc.)
    setWaitingForJoin(); // Mark that we're expecting join confirmation
    sendMessage({
        type: 'JOIN_GAME',
        playerName
    });

    console.log(`🎮 Joining as: ${playerName}`)

    // Don't hide form yet - wait for server confirmation
    // Form will be hidden in updateLobbyUI() when we successfully join
}

// Handle start game button
function handleStartGame(): void {
    sendMessage({
        type: 'START_GAME'
    });
    console.log('🎮 Starting game...');
}

// Update the player list display
export function updateLobbyUI(): void {
    const state = getGameState();
    const localPlayerId = getLocalPlayerId();

    // Hide join form if we've successfully joined (have a localPlayerId)
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        if (localPlayerId) {
            joinForm.style.display = 'none';
        } else {
            joinForm.style.display = 'block';
        }
    }

    // Update player list
    const playerList = document.getElementById('player-list');
    if (playerList) {
        playerList.innerHTML = '';
        state.players.forEach((player, index) => {
            const li = document.createElement('li');
            li.textContent = player.name;
            // First player (index 0) is the host
            if (index === 0) {
                li.textContent += ' (Host)';
                li.style.fontWeight = 'bold';
            }
            playerList.appendChild(li);
        });
    }

    // Update player count
    const playerCount = document.getElementById('player-count');
    if (playerCount) {
        playerCount.textContent = `(${state.players.length}/${GAME_RULES.MAX_PLAYERS})`;
    }

    // Show/hide start button for host
    const startButton = document.getElementById('start-button') as HTMLButtonElement;
    if (startButton) {
        const localPlayerId = getLocalPlayerId();
        const localPlayerIndex = state.players.findIndex(p => p.id === localPlayerId);
        const isHost = localPlayerIndex === 0; // First player is host
        const enoughPlayers = state.players.length >= GAME_RULES.MIN_PLAYERS;

        if (isHost) {
            startButton.style.display = 'block';
            startButton.disabled = !enoughPlayers;
            startButton.textContent = enoughPlayers
                ? 'Start Game'
                : `Waiting for players (${state.players.length}/${GAME_RULES.MIN_PLAYERS})`;
        } else {
            startButton.style.display = 'none';
        }
    }
}
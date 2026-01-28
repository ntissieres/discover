# Discover - Phase 0 Development Todo

## Build Order & Progress Tracking

This document follows the recommended learning path to build the multiplayer music game from scratch.

---

## 1. Backend Setup & Foundation ✅

### 1.1 Setup Backend Package.json
**Status:** ✅ Complete  
**Files:** `backend/package.json`, `backend/tsconfig.json`

**Tasks:**
- [x] Add dependencies: `express`, `ws`, `cors`
- [x] Add dev dependencies: `typescript`, `@types/node`, `@types/ws`, `@types/express`, `ts-node`, `nodemon`
- [x] Create build script
- [x] Create dev script with hot reload
- [x] Configure TypeScript compiler options

**Acceptance Criteria:**
- ✅ `npm install` runs without errors
- ✅ `npm run dev` starts the server

**Learning Focus:** Node.js project setup, TypeScript configuration, development workflow

---

### 1.2 Create Basic HTTP Server
**Status:** ✅ Complete  
**Files:** `backend/src/server.ts`

**Tasks:**
- [x] Import Express and create app instance
- [x] Configure CORS for frontend connection
- [x] Set up port configuration (e.g., 3000)
- [x] Add basic health check endpoint (`GET /health`)
- [x] Start HTTP server listening
- [x] Add error handling for port conflicts

**Acceptance Criteria:**
- ✅ Server starts on port 3000
- ✅ Can access `http://localhost:3000/health` in browser
- ✅ Console logs show server is running

**Learning Focus:** Express basics, HTTP servers, port binding

---

### 1.3 Add WebSocket Server
**Status:** ✅ Complete  
**Files:** `backend/src/socketServer.ts`

**Tasks:**
- [x] Import `ws` library
- [x] Create WebSocket server attached to HTTP server
- [x] Handle new client connections
- [x] Handle client disconnections
- [x] Log connection events
- [x] Create utility to broadcast messages to all clients

**Acceptance Criteria:**
- ✅ WebSocket server runs alongside HTTP server
- ✅ Connection/disconnection events are logged
- ✅ No crashes when client connects/disconnects
- ✅ Broadcast tested and working with multiple clients

**Learning Focus:** WebSocket protocol, event-driven architecture, client lifecycle

---

## 2. Game State Management

### 2.1 Initialize Game State
**Status:** Not Started  
**Files:** `backend/src/game/gameState.ts`

**Tasks:**
- [ ] Import shared types (GameState, Player, Track)
- [ ] Create singleton game state object
- [ ] Initialize with default values (LOBBY phase, empty players array)
- [ ] Create function to get current state
- [ ] Create function to reset state
- [ ] Add helper to find player by ID

**Acceptance Criteria:**
- Game state matches `GameState` interface from shared types
- Can access and modify state
- State persists across function calls

**Learning Focus:** State management patterns, singleton pattern, type safety

---

### 2.2 Implement Lobby Logic
**Status:** Not Started  
**Files:** `backend/src/game/lobby.ts`

**Tasks:**
- [ ] Create `addPlayer(name)` function that generates player ID
- [ ] Validate MIN_PLAYERS and MAX_PLAYERS from gameRules
- [ ] Create `removePlayer(playerId)` function
- [ ] Create `canStartGame()` check (2-4 players)
- [ ] Create `startGame()` function to transition to CREATION phase
- [ ] Broadcast updated game state after player changes

**Acceptance Criteria:**
- Cannot start with < 2 players
- Cannot add > 4 players
- Players get unique IDs
- All clients receive state updates

**Learning Focus:** Validation logic, game rules enforcement, state transitions

---

### 2.3 Connection Handler
**Status:** Not Started  
**Files:** `backend/src/handlers/connection.ts`

**Tasks:**
- [ ] Handle JOIN_GAME message
- [ ] Extract player name from message
- [ ] Add player to lobby
- [ ] Store player's WebSocket connection
- [ ] Handle disconnect event (remove player)
- [ ] Map socket to player ID for message routing

**Acceptance Criteria:**
- Players can join with a name
- Disconnected players are removed
- Remaining players see updated list
- Game continues with ≥2 players

**Learning Focus:** Message handling, connection mapping, graceful disconnection

---

## 3. Frontend Setup & Connection

### 3.1 Setup Frontend Package.json
**Status:** Not Started  
**Files:** `frontend/package.json`, `frontend/tsconfig.json`

**Tasks:**
- [ ] Add Vite as dev dependency
- [ ] Add TypeScript
- [ ] Create dev script with Vite
- [ ] Create build script
- [ ] Configure TypeScript for DOM
- [ ] Set up path aliases for clean imports

**Acceptance Criteria:**
- `npm install` runs without errors
- `npm run dev` starts dev server on port 5173
- Can access `http://localhost:5173` in browser

**Learning Focus:** Frontend build tools, Vite configuration, TypeScript for web

---

### 3.2 Create HTML Structure
**Status:** Not Started  
**Files:** `frontend/index.html`

**Tasks:**
- [ ] Add basic HTML5 structure
- [ ] Link to main.css
- [ ] Create container divs for different phases
- [ ] Add script tag for main.ts (type="module")
- [ ] Add meta tags for viewport

**Acceptance Criteria:**
- HTML validates
- Page loads without errors
- TypeScript module loads

**Learning Focus:** HTML5 structure, module script loading

---

### 3.3 WebSocket Client
**Status:** Not Started  
**Files:** `frontend/src/network/socket.ts`

**Tasks:**
- [ ] Create WebSocket connection to `ws://localhost:3000`
- [ ] Handle connection open event
- [ ] Handle incoming messages (parse JSON)
- [ ] Create `send()` helper function
- [ ] Handle connection errors
- [ ] Handle reconnection logic
- [ ] Export singleton socket instance

**Acceptance Criteria:**
- Connects to backend successfully
- Can send and receive messages
- Console logs show connection status

**Learning Focus:** WebSocket client API, connection management, error handling

---

### 3.4 Network Message Handlers
**Status:** Not Started  
**Files:** `frontend/src/network/handlers.ts`

**Tasks:**
- [ ] Create handler for GAME_STATE_UPDATE messages
- [ ] Create handler for ERROR messages
- [ ] Update local game state when messages arrive
- [ ] Route messages to appropriate handlers
- [ ] Log received messages for debugging

**Acceptance Criteria:**
- Game state updates when server sends new state
- Error messages are displayed to user

**Learning Focus:** Message routing, event handlers, state synchronization

---

### 3.5 Frontend Game State
**Status:** Not Started  
**Files:** `frontend/src/game/gameState.ts`

**Tasks:**
- [ ] Create local copy of game state
- [ ] Create `updateGameState()` function
- [ ] Create event emitter for state changes
- [ ] Create getters for current phase, players, tracks
- [ ] Find local player in player list

**Acceptance Criteria:**
- Local state stays in sync with server
- UI can query current game state
- State changes trigger UI updates

**Learning Focus:** Client-side state management, observer pattern

---

## 4. Audio Engine

### 4.1 Audio Context Initialization
**Status:** Not Started  
**Files:** `frontend/src/audio/audioContext.ts`

**Tasks:**
- [ ] Create singleton AudioContext
- [ ] Handle suspended state (requires user interaction)
- [ ] Create `initAudio()` function called on first user click
- [ ] Add function to check if audio is ready
- [ ] Handle browser compatibility

**Acceptance Criteria:**
- AudioContext only created once
- No autoplay warnings in console
- Audio initializes on user interaction

**Learning Focus:** Web Audio API basics, browser autoplay policies, singleton pattern

---

### 4.2 Build Synthesizer
**Status:** Not Started  
**Files:** `frontend/src/audio/synth.ts`

**Tasks:**
- [ ] Create Synth class
- [ ] Store synth settings (waveform, volume, ADSR)
- [ ] Create method to update settings
- [ ] Create audio node graph (Oscillator → Gain → Destination)
- [ ] Implement ADSR envelope calculation
- [ ] Apply envelope to gain over time

**Acceptance Criteria:**
- Can change waveform (sine/saw/square)
- Volume control works
- ADSR shapes the sound naturally
- No audio clicks or pops

**Learning Focus:** Audio synthesis, node graphs, envelope shaping, audio scheduling

---

### 4.3 Note Playback API
**Status:** Not Started  
**Files:** `frontend/src/audio/playback.ts`

**Tasks:**
- [ ] Create `playNote(frequency)` function
- [ ] Start oscillator with given frequency
- [ ] Apply attack phase to gain
- [ ] Apply decay to sustain level
- [ ] Create `stopNote()` function
- [ ] Apply release phase
- [ ] Stop and cleanup oscillator after release
- [ ] Prevent multiple simultaneous notes (monophonic)

**Acceptance Criteria:**
- Notes sound smooth (no clicks)
- Envelope shapes each note
- Notes can be played sequentially
- Cleanup prevents memory leaks

**Learning Focus:** Audio scheduling, envelope timing, resource cleanup

---

## 5. Melody Creation

### 5.1 Build Melody Grid UI
**Status:** Not Started  
**Files:** `frontend/src/melody/grid.ts`

**Tasks:**
- [ ] Create grid container (16 steps × 12 pitches)
- [ ] Generate grid cells as buttons or divs
- [ ] Add click handlers to toggle notes
- [ ] Visual feedback for active notes (CSS class)
- [ ] Store grid state as Set or Array
- [ ] Create function to get all active notes
- [ ] Create function to clear grid

**Acceptance Criteria:**
- Can click to add/remove notes
- Visual feedback is immediate
- Grid state can be read
- Grid is visually clear

**Learning Focus:** Grid-based UI, DOM manipulation, state representation

---

### 5.2 Melody Serialization
**Status:** Not Started  
**Files:** `frontend/src/melody/serializer.ts`

**Tasks:**
- [ ] Convert grid state to MelodyData format
- [ ] Map grid positions to pitch/step values
- [ ] Create `serialize()` function
- [ ] Create `deserialize()` function to load melodies
- [ ] Handle empty melodies

**Acceptance Criteria:**
- Grid state converts to JSON
- Can recreate grid from JSON
- Format matches MelodyData type

**Learning Focus:** Data serialization, protocol design

---

### 5.3 Melody Player
**Status:** Not Started  
**Files:** `frontend/src/melody/player.ts`

**Tasks:**
- [ ] Create MelodyPlayer class
- [ ] Set fixed tempo (120 BPM)
- [ ] Calculate step duration from tempo
- [ ] Create `play()` function that loops through steps
- [ ] Trigger synth.playNote() for active notes at each step
- [ ] Create `stop()` function
- [ ] Add loop option
- [ ] Show current step visually

**Acceptance Criteria:**
- Melody plays in rhythm
- Timing is consistent
- Can start/stop playback
- Loops correctly if enabled

**Learning Focus:** Sequencers, musical timing, interval-based execution

---

## 6. Game Flow UI

### 6.1 Lobby UI
**Status:** Not Started  
**Files:** `frontend/src/ui/lobby.ts`

**Tasks:**
- [ ] Create lobby container in HTML
- [ ] Show "Join Game" form (name input + button)
- [ ] Display list of connected players
- [ ] Show player count (X/4)
- [ ] Add "Start Game" button (visible to first player)
- [ ] Disable start if < 2 players
- [ ] Send JOIN_GAME message on form submit

**Acceptance Criteria:**
- Can enter name and join
- See other players join
- Start button works when ready
- UI is clear and responsive

**Learning Focus:** Form handling, dynamic lists, conditional UI

---

### 6.2 Creation Phase UI
**Status:** Not Started  
**Files:** `frontend/src/ui/creation.ts`

**Tasks:**
- [ ] Create creation container
- [ ] Add synth controls (waveform selector, volume slider, ADSR sliders)
- [ ] Add melody grid
- [ ] Add play/stop buttons for preview
- [ ] Add "Submit Track" button
- [ ] Wire synth controls to audio engine
- [ ] Test sound button to hear synth
- [ ] Collect synth settings + melody on submit
- [ ] Send SUBMIT_TRACK message

**Acceptance Criteria:**
- All controls work
- Can create and hear melody
- Submit sends data to server
- UI is intuitive

**Learning Focus:** Complex UI composition, audio-visual feedback, form data collection

---

### 6.3 Timer Display
**Status:** Not Started  
**Files:** `frontend/src/game/timer.ts`

**Tasks:**
- [ ] Create timer display element
- [ ] Format time as MM:SS
- [ ] Update display every second
- [ ] Change color when < 30 seconds (urgency)
- [ ] Show timer only during CREATION phase
- [ ] Sync with server time (use server's roundTimeRemaining)

**Acceptance Criteria:**
- Timer counts down visibly
- Color change creates urgency
- Timer is accurate

**Learning Focus:** Time formatting, periodic updates, visual feedback

---

### 6.4 Listening Phase UI
**Status:** Not Started  
**Files:** `frontend/src/ui/listening.ts`

**Tasks:**
- [ ] Create listening container
- [ ] Display each submitted track as card
- [ ] Show track owner name
- [ ] Add play button for each track
- [ ] Reconstruct synth from track's synthSettings
- [ ] Play melody using track's melodyData
- [ ] Add stop button
- [ ] Highlight currently playing track

**Acceptance Criteria:**
- All tracks are visible
- Can play each track
- Audio recreates original sound
- Clear which track is playing

**Learning Focus:** Track reconstruction, synth parameter application, list rendering

---

### 6.5 Selection Phase UI
**Status:** Not Started  
**Files:** `frontend/src/ui/selection.ts`

**Tasks:**
- [ ] Create selection container
- [ ] Display tracks as selectable cards
- [ ] Add "Vote" button to each track
- [ ] Disable own track (can't vote for yourself)
- [ ] Show which track you selected
- [ ] Send SELECT_TRACK message
- [ ] Show "Waiting for others..." after voting

**Acceptance Criteria:**
- Cannot select own track
- One vote per player
- Clear visual feedback
- Vote is sent to server

**Learning Focus:** Voting UI, validation, feedback states

---

### 6.6 Results Phase UI
**Status:** Not Started  
**Files:** `frontend/src/ui/results.ts`

**Tasks:**
- [ ] Create results container
- [ ] Display each player with points
- [ ] Show points gained this round
- [ ] Show total points
- [ ] Highlight winner
- [ ] Add "Play Again" button (resets game)
- [ ] Show vote breakdown (who voted for what)

**Acceptance Criteria:**
- Results are clear and readable
- Winner is obvious
- Can restart game

**Learning Focus:** Scoreboard display, data visualization, game loop completion

---

### 6.7 Phase Manager
**Status:** Not Started  
**Files:** `frontend/src/game/phaseManager.ts`

**Tasks:**
- [ ] Create manager that switches between phase UIs
- [ ] Hide all phase containers by default
- [ ] Show appropriate container based on current phase
- [ ] Initialize phase-specific logic when entering phase
- [ ] Cleanup when leaving phase
- [ ] Handle transitions smoothly

**Acceptance Criteria:**
- Only one phase visible at a time
- Transitions are smooth
- No memory leaks from old phases

**Learning Focus:** State machines, UI lifecycle, transitions

---

## 7. Multiplayer Flow

### 7.1 Track Submission Handler (Backend)
**Status:** Not Started  
**Files:** `backend/src/handlers/trackSubmission.ts`

**Tasks:**
- [ ] Handle SUBMIT_TRACK message
- [ ] Validate track data (has synthSettings and melody)
- [ ] Generate unique track ID
- [ ] Associate track with player
- [ ] Store track in game state
- [ ] Check if all players submitted
- [ ] If all submitted, transition to LISTENING phase
- [ ] Broadcast updated game state

**Acceptance Criteria:**
- Invalid tracks are rejected
- Each player has one track
- Phase advances when all submitted
- All clients receive tracks

**Learning Focus:** Data validation, phase progression, collection completion

---

### 7.2 Selection Handler (Backend)
**Status:** Not Started  
**Files:** `backend/src/handlers/selection.ts`

**Tasks:**
- [ ] Handle SELECT_TRACK message
- [ ] Validate trackId exists
- [ ] Validate player isn't selecting own track
- [ ] Store selection (player → track mapping)
- [ ] Check if all players selected
- [ ] If all selected, calculate scores
- [ ] Transition to RESULTS phase
- [ ] Broadcast results

**Acceptance Criteria:**
- Invalid selections rejected
- Can't vote for own track
- Phase advances when all voted
- Scores calculated correctly

**Learning Focus:** Validation, vote collection, phase orchestration

---

### 7.3 Scoring System
**Status:** Not Started  
**Files:** `backend/src/game/scoring.ts`

**Tasks:**
- [ ] Create function to calculate scores from selections
- [ ] Count votes per track
- [ ] Award points to track owners (+1 per vote)
- [ ] Update player points in game state
- [ ] Create results summary object
- [ ] Determine winner (highest points)
- [ ] Handle ties

**Acceptance Criteria:**
- Votes are counted correctly
- Points awarded accurately
- Winner determination works
- Results include breakdown

**Learning Focus:** Vote counting, score aggregation, winner determination

---

### 7.4 Phase Transitions
**Status:** Not Started  
**Files:** `backend/src/game/phases.ts`

**Tasks:**
- [ ] Create `transitionToPhase(newPhase)` function
- [ ] Update game state phase
- [ ] Initialize phase-specific state (e.g., reset timer)
- [ ] Validate transition is valid
- [ ] Broadcast state update
- [ ] Log phase changes

**Acceptance Criteria:**
- Phases transition in correct order
- State is reset appropriately
- All clients notified

**Learning Focus:** State machines, game flow, orchestration

---

### 7.5 Timer System (Backend)
**Status:** Not Started  
**Files:** `backend/src/game/phases.ts` (continued)

**Tasks:**
- [ ] Create countdown timer for CREATION phase
- [ ] Set timer to ROUND_DURATION_SECONDS when phase starts
- [ ] Decrement every second
- [ ] Broadcast time updates periodically
- [ ] Auto-submit empty tracks for players who didn't submit
- [ ] Transition to LISTENING when timer reaches 0

**Acceptance Criteria:**
- Timer counts down accurately
- Clients see timer updates
- Phase auto-advances
- Non-submitters handled gracefully

**Learning Focus:** Server-side timing, auto-progression, fairness

---

## 8. Polish & Robustness

### 8.1 Disconnection Handling
**Status:** Not Started  
**Files:** `backend/src/handlers/connection.ts` (expand)

**Tasks:**
- [ ] Mark player as disconnected (don't remove immediately)
- [ ] If ≥2 players remain, continue game
- [ ] If < 2 players, end game
- [ ] Handle reconnection (same player rejoins)
- [ ] Clean up orphaned tracks/selections
- [ ] Notify other players

**Acceptance Criteria:**
- Game continues with enough players
- Game ends gracefully with too few
- No crashes on disconnect

**Learning Focus:** Graceful degradation, edge case handling

---

### 8.2 Error Handling
**Status:** Not Started  
**Files:** Multiple backend handlers

**Tasks:**
- [ ] Add try-catch blocks around message handlers
- [ ] Validate all incoming data
- [ ] Send ERROR messages for invalid actions
- [ ] Log errors with context
- [ ] Prevent crashes from malformed messages

**Acceptance Criteria:**
- Server doesn't crash on bad input
- Clients receive clear error messages
- Errors are logged

**Learning Focus:** Defensive programming, error handling patterns

---

### 8.3 Logging System
**Status:** Not Started  
**Files:** `backend/src/utils/logger.ts`

**Tasks:**
- [ ] Create logger with timestamp
- [ ] Log levels: INFO, WARN, ERROR
- [ ] Color coding for console output
- [ ] Log key events: joins, disconnects, phase changes, selections
- [ ] Include player IDs/names in logs

**Acceptance Criteria:**
- Logs are readable
- Can debug issues from logs
- Timestamps help with timing issues

**Learning Focus:** Logging best practices, debugging tools

---

### 8.4 Basic Styling
**Status:** Not Started  
**Files:** `frontend/src/styles/main.css`

**Tasks:**
- [ ] Add basic layout (centered content)
- [ ] Style forms and buttons
- [ ] Style grid (clear cells, active notes highlighted)
- [ ] Style synth controls (sliders, selectors)
- [ ] Add phase-specific styling
- [ ] Make timer visible and urgent
- [ ] Basic responsive design

**Acceptance Criteria:**
- UI is usable and clear
- Controls are clickable
- Grid is understandable
- Not beautiful, but functional

**Learning Focus:** Functional CSS, usability

---

## 9. Integration & Testing

### 9.1 End-to-End Test
**Status:** Not Started

**Tasks:**
- [ ] Open 2-4 browser windows
- [ ] Join game from each
- [ ] Start game
- [ ] Create different tracks in each window
- [ ] Submit all tracks
- [ ] Listen to all tracks
- [ ] Vote from each player
- [ ] Verify scores are correct
- [ ] Check winner is correct

**Acceptance Criteria:**
- Complete game flow works
- No crashes
- Scores are accurate
- Fun enough to want to play again

**Learning Focus:** Integration testing, user experience

---

### 9.2 Bug Fixes
**Status:** Not Started

**Tasks:**
- [ ] Test disconnect during each phase
- [ ] Test invalid messages
- [ ] Test timer edge cases
- [ ] Test audio initialization issues
- [ ] Fix any discovered bugs

**Acceptance Criteria:**
- All major bugs fixed
- Game is stable

**Learning Focus:** Testing, debugging

---

## Phase 0 Complete! 🎉

You'll have built:
- ✅ Real-time multiplayer game
- ✅ Audio synthesis engine
- ✅ Melody creation tool
- ✅ Voting system
- ✅ Complete game loop

**Next Steps After Phase 0:**
- Add filter to synth (Task Group 2 "Should Have")
- Add multiple rounds
- Add effects (reverb, delay, distortion)
- Visual polish
- Better UX

---

## Notes & Lessons Learned

Use this section to track:
- Challenges you faced
- Solutions you discovered
- Resources that helped
- Ideas for improvements

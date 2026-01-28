Phase 0 — Detailed Task Breakdown
Phase 0 Objective (context for the LLM)

Build a playable prototype of a multiplayer music game that allows 2–4 players to complete one round of gameplay: create a sound, create a short melody under time pressure, listen to others, select a track, and receive points.

Explicit Non-Goals

No user accounts

No persistence

No matchmaking

No audio effects beyond the basic synth

No visual polish

No mobile support

Global Constraints

Platform: Web application

Audio: Web Audio API only

Multiplayer: WebSockets

Synchronization: game state only (no audio streaming)

Latency tolerance: non-real-time (turn-based flow)

Task Group 1 — Project Skeleton
Task 1.1 — Repository Setup

Create a frontend web project

Create a backend Node.js server

Ensure frontend and backend can run independently

Provide basic README instructions

Acceptance criteria

npm install + npm run dev works for both frontend and backend

Frontend loads in browser

Backend starts a WebSocket server

Task 1.2 — Shared Game State Definitions

Define a shared schema (can be duplicated manually) for:

Player

id (string)

name (string)

points (number)

Game

players (array)

phase (enum)

roundTimer (number)

Track

id

ownerPlayerId

synthSettings (object)

melodyData (object)

Acceptance criteria

All game logic refers to these structures consistently

Game phases are explicit (e.g. CREATION, LISTENING, SELECTION, RESULTS)

Task Group 2 — Audio Engine (Frontend)
Task 2.1 — Audio Context Initialization

Initialize a single AudioContext on user interaction

Prevent multiple contexts from being created

Handle browser autoplay restrictions

Acceptance criteria

Sound only starts after user interaction

No console warnings about suspended audio contexts

Task 2.2 — Minimal Synth Engine

Implement a minimal monophonic synth using Web Audio API:

Components

OscillatorNode

waveform: sine | sawtooth | square

GainNode (volume)

ADSR envelope applied to gain

Controls

Waveform selector

Volume slider

Attack slider

Decay slider

Sustain slider

Release slider

Acceptance criteria

Changing parameters updates sound immediately

Envelope correctly shapes note playback

No audio clicks on note start/stop

Task 2.3 — Note Playback API

Expose a simple API:

playNote(frequency)

stopNote()

Acceptance criteria

Notes start and stop cleanly

Multiple notes can be played sequentially without audio artifacts

Task Group 3 — Melody Creation UI
Task 3.1 — Melody Grid

Create a simple time vs pitch grid

Fixed length (e.g. 1 bar, fixed tempo)

Click to toggle notes on/off

Constraints

No dragging

No velocity

No polyphony

Acceptance criteria

Notes can be added and removed

Grid state can be serialized to JSON

Task 3.2 — Melody Playback

Play the melody using the synth

Fixed tempo

Loop playback optional

Acceptance criteria

Melody playback matches grid state

Timing is consistent enough for gameplay

Task Group 4 — Game Flow (Frontend)
Task 4.1 — Game Phases UI

Implement UI states for:

Waiting / Lobby

Creation phase

Listening phase

Selection phase

Results phase

Acceptance criteria

UI clearly changes between phases

Player understands what to do in each phase

Task 4.2 — Timer

Display countdown timer during creation phase

Automatically end phase when timer reaches zero

Acceptance criteria

Timer is visible

Phase transitions automatically

Task Group 5 — Multiplayer (Backend)
Task 5.1 — WebSocket Server

Accept client connections

Assign temporary player IDs

Broadcast game state updates

Acceptance criteria

Multiple clients can connect

Server logs player connections/disconnections

Task 5.2 — Lobby Logic

Allow up to 4 players

Game starts manually or automatically when enough players join

Acceptance criteria

All players see the same lobby state

Game does not start with fewer than 2 players

Task 5.3 — State Authority

Server is authoritative for:

Game phase

Timer

Track ownership

Points

Acceptance criteria

Clients cannot modify game state arbitrarily

Server broadcasts updates consistently

Task Group 6 — Track Sharing & Selection
Task 6.1 — Track Submission

At end of creation phase:

Client sends synth settings + melody data to server

Server stores tracks per player

Acceptance criteria

Each player has exactly one submitted track

Data is validated server-side

Task 6.2 — Listening Phase

Clients can play other players’ tracks locally

Tracks are reconstructed using received data

Acceptance criteria

All tracks are audible

Playback uses the same synth engine

Task 6.3 — Selection Phase

Each player selects one other player’s track

Cannot select own track

Selection is sent to server

Acceptance criteria

Invalid selections are rejected

Each player submits exactly one selection

Task 6.4 — Scoring

For each selection:

Selected track owner gains +1 point

Acceptance criteria

Points are calculated server-side

Updated scores are broadcast

Task Group 7 — End of Round / Results
Task 7.1 — Results Screen

Show:

Player names

Points gained this round

Total points

Acceptance criteria

Results are readable

Winning player is highlighted

Task 7.2 — Game End

After results:

Game ends (Phase 0 has only one round)

Option to restart manually

Acceptance criteria

Game does not automatically loop

Restart resets all state

Task Group 8 — Error Handling & Safety
Task 8.1 — Disconnections

Handle player disconnects gracefully

If player leaves mid-round:

Remove them from game

Continue if ≥2 players remain

Acceptance criteria

No crashes

Game state remains consistent

Task 8.2 — Logging

Log key events:

Player join/leave

Phase changes

Selections

Scoring

Acceptance criteria

Logs are readable and useful for debugging

Final Phase 0 Definition of Done

Phase 0 is complete when:

 2–4 players can play one full round

 Each player creates a sound + melody

 Players can listen to each other

 Players select another track

 Points are awarded correctly

 No crashes or blocking bugs

 The game is fun enough to want a second round
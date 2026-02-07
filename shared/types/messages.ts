import { GameState } from "./game";
import { Track } from "./track";

export type ClientToServerMessage = 
    | { type: "JOIN_GAME"; playerName: string }
    | { type: "START_GAME" }
    | { type: "SUBMIT_TRACK"; track: Track }
    | { type: "READY_TO_SELECT"}
    | { type: "SELECT_TRACK"; trackId: string };

export type ServerToClientMessage = 
    | { type: "CONNECTED"; message: string }
    | { type: "GAME_STATE_UPDATE"; gameState: GameState }
    | { type: "ERROR"; message: string };
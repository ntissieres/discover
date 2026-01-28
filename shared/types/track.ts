import { SynthSettings, MelodyData } from "./game";

export interface Track {
    id: string;
    ownerPlayerId: string;
    synthSettings: SynthSettings;
    melody: MelodyData;
}
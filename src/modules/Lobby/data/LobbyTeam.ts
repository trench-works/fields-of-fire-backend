import { TeamColor } from "../../Game/data/Team";
import { LobbyPlayer } from "./Lobby";

export class LobbyTeam {
    players!: LobbyPlayer[];
    ai!: number;
    color!: TeamColor;
}

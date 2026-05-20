import { Player } from "../../../Player/data/Player";
import { Entity } from "../../data/Entity";
import { Game } from "../../data/Game";

export class JoinGameResponse {
    game!: Game;
    player!: Player;
    playerEntity!: Entity;
}
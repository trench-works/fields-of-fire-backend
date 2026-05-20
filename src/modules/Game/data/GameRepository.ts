import { MappedRepository } from "../../../core";
import { Game } from "./Game";

export class GameDataManager extends MappedRepository<Game> {
    constructor() {
        super("game", {
            "3630": {
                id: "3630",
                creatorId: "dev",
                plateau: [
                    [{entityId: "arthurchar"}, null, null, null, null, null, null, null, null, null],
                    [null, null ,null ,null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, null, null, {entityId: "enemy1"}, null],
                    [null, null, null, null, null, null, null, null, null, null],
                    [null, null, null, null, null, null, {entityId: "enemy2"}, null, null, null],
                    [null, null, null, null, null, null, null, null, null, null]
                    ],
                players: [
                    {
                        playerId: "dev",
                        entityId: "arthurchar",
                        gameId: "3630"
                    },
                ],
                npc : [
                    {
                        entityId: "ennemy1",
                        gameId: "3630"
                    },
                    {
                        entityId: "ennemy2",
                        gameId: "3630"
                    }
                ],
                entities: [
                    {
                        entityId: "arthurchar",
                        position: {
                            x: 2,
                            y: 2,
                        },
                        modifier: [],
                    },
                    {
                        entityId: "ennemy1",
                        name: "Fantassin de l'Alliance",
                        position: {
                            x: 6,
                            y: 8
                        },
                        modifier: [],
                    },
                    {
                        entityId: "ennemy2",
                        name: "Fantassin de l'Alliance",
                        position: {
                            x: 8,
                            y: 6
                        },
                        modifier: [],
                    }
                ]
            }
        })
    }
}

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
                        id: "dev",
                        entity: "arthurchar",
                    },
                ],
                npc : [
                    {
                        entity: "ennemy1",
                    },
                    {
                        entity: "ennemy2",
                    }
                ],
                entities: [
                    {
                        entityId: "arthurchar",
                        characterClass: {},
                        stats: {
                            speed: 10,
                            hp: 200,
                        },
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
                        sprite: "alliance_fantassin",
                        modifier: [],
                    },
                    {
                        entityId: "ennemy2",
                        name: "Fantassin de l'Alliance",
                        position: {
                            x: 8,
                            y: 6
                        },
                        sprite: "alliance_fantassin",
                        modifier: [],
                    }
                ]
            }
        })
    }
}

import { MappedRepository } from "../../../core";
import { Game } from "./Game";

export class GameDataManager extends MappedRepository<Game> {
    constructor() {
        super("game", {
            "3630": {
                id: "3630",
                creatorId: "dev",
                plateau: [
                    [{isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false, entityId: "enemy1"}, {isWall: false, isHole: false}],
                    [{isWall: true, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: true}, {isWall: false, isHole: true}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: true, isHole: false}, {isWall: false, isHole: false, entityId: "enemy2"}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    [{isWall: false, isHole: true}, {isWall: false, isHole: true}, {isWall: false, isHole: true}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}, {isWall: false, isHole: false}],
                    ],
                players: [
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
                        entityId: "ennemy1",
                        characterClassId: "alliance_fantassin",
                        position: {
                            x: 6,
                            y: 8
                        },
                        modifier: [],
                    },
                    {
                        entityId: "ennemy2",
                        characterClassId: "alliance_fantassin",
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

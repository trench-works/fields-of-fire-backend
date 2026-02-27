import { MappedRepository } from "../../../core/app/Database/MappedRepository";
import { Game } from "./Game";

export class GameDataManager extends MappedRepository<Game> {
    constructor() {
        super("game", {
            "3630": {
                id: "3630",
                creatorId: "dev",
                players: [
                    {
                        id: "arthurchar",
                        userId: "dev",
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
                ],
            }
        })
    }
}

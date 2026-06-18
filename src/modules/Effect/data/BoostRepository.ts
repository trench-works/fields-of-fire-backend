import { FolderRepository } from "../../../core";
import { Boost } from "./Boost";

export class BoostRepository extends FolderRepository<Boost> {
    async entityToRessource(entity: Boost): Promise<Boost> {
        return {
            ...entity,
        };
    }
    constructor() {
        super("boosts", {
            life: {
                id: "life",
                name: "Renforcement Musculaire",
                effects: [],
                boosts: [{ maxLife: 10 }],
                probability: 1,
            },
            precision: {
                id: "precision",
                name: "Précision",
                effects: [],
                boosts: [{ precision: 25 }],
                probability: 1,
            },
            versatile: {
                id: "versatile",
                name: "Polyvalence",
                effects: [],
                boosts: [
                    {
                        strength: 10,
                        precision: 10,
                    },
                ],
                probability: 1,
            },
            armor: {
                id: "armor",
                name: "Armure",
                effects: [],
                boosts: [
                    {
                        armor: 10,
                    },
                ],
                probability: 1,
            },
            strength: {
                id: "strength",
                name: "Force",
                effects: [],
                boosts: [{ strength: 25 }],
                probability: 1,
            },
            heal: {
                id: "heal",
                name: "Soin",
                effects: [],
                boosts: [],
                probability: 1,
            },
            vampire: {
                id: "vampire",
                name: "Vampirisme",
                effects: ["vampire"],
                boosts: [],
                probability: 1,
            },
            reaction: {
                id: "reaction",
                name: "Adrénaline",
                effects: ["reaction"],
                boosts: [],
                probability: 1,
            },
            energy: {
                id: "energy",
                name: "Energie",
                effects: [],
                boosts: [{ energy: 2 }],
                probability: 1,
            },
            acceleration: {
                id: "acceleration",
                name: "Acceleration",
                effects: [],
                boosts: [{ mouvement: 2 }],
                probability: 1,
            },
            dodge: {
                id: "dodge",
                name: "Esquive",
                effects: [],
                boosts: [
                    {
                        dodging: 3,
                        mouvement: 1,
                    },
                ],
                probability: 1,
            },
            reinforcement: {
                id: "reinforcement",
                name: "Renforcement",
                effects: [],
                boosts: [],
                probability: 1,
            },
        });
    }
}

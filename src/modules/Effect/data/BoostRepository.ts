import { FolderRepository } from "../../../core";
import { Boost, BoostType } from "./Boost";

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
                boosts: [
                    {
                        maxLife: 15,
                        life: 15,
                    },
                ],
                probability: 1,
            },
            precision: {
                id: "precision",
                name: "Précision",
                effects: [],
                boosts: [{ precision: 30 }],
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
                        armor: 15,
                    },
                ],
                probability: 1,
            },
            strength: {
                id: "strength",
                name: "Force",
                effects: [],
                boosts: [{ strength: 30 }],
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
                effects: [],
                boosts: [
                    {
                        life: 8,
                        maxLife: 8,
                        strength: 5,
                        precision: 5,
                        dodging : 1,
                        initiative: 15,
                    },
                ],
                probability: 1,
            },
            energy: {
                id: "energy",
                name: "Energie",
                effects: [],
                boosts: [{ totalEnergy: 1 }],
                probability: 1,
            },
            acceleration: {
                id: "acceleration",
                name: "Acceleration",
                effects: [],
                boosts: [{ totalMouvement: 1 }],
                probability: 1,
            },
            dodge: {
                id: "dodge",
                name: "Esquive",
                effects: [],
                boosts: [
                    {
                        dodging: 3,
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
                type: BoostType.AI,
            },
        });
    }
}

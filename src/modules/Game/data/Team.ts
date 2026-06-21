export enum TeamColor {
    BLUE = "BLUE",
    ROUGE = "ROUGE",
}

export enum TeamName {
    PLAYERS = "Players",
    MOBS = "Mobs",
}

export type Team = {
    id: string;
    name: string;
    color: TeamColor;
    // Entities
    playerIds: string[];
    npcIds: string[];
    entitiesIds: string[];
};

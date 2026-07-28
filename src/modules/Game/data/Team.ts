export enum TeamColor {
    BLUE = "BLUE",
    RED = "RED",
    YELLOW = "YELLOW",
    GREEN = "GREEN",
}

export const TEAM_COLORS: TeamColor[] = [
    TeamColor.BLUE,
    TeamColor.RED,
    TeamColor.YELLOW,
    TeamColor.GREEN,
];

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

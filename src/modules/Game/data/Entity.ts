export enum EntityType {
    ALLY = "allié",
    ENNEMI = "ennemi",
    NEUTRAL = "neutre",
}

export type Entity = {
    entityId : string
    entityType? : string;
    name? : string;
    description?: string;
    position: { x: number; y: number };
    actionList?: string[];
    sprite?: string;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    characterClass?: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    stats?: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    modifier?: {}[];
}
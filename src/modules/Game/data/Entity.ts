export enum EntityType {
  ALLY = "allié",
  ENNEMI = "ennemi",
  NEUTRAL = "neutre",
}

export type Entity = {
  entityId: string;
  entityType?: EntityType;
  name?: string;
  position: { x: number; y: number };
  actionList?: string[];

  characterClassId: string;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  stats?: {};
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  modifier?: {}[];
};

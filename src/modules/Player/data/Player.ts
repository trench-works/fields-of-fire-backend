export type Player = {
    id: string;
    userId: string;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    characterClass: {};
    stats: { speed: number; hp: number };
    position: { x: number; y: number };
    modifier: { speed: number }[];
};

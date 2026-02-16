export type Player = {
    id: string;
    userId: string;
    characterClass: {};
    stats: { speed: number; hp: number };
    position: { x: number; y: number };
    modifier: { speed: number }[];
};

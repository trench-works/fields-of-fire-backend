export type GameAnimation = {
    key: "move" | "action";
    entityId: string;
    data: Record<string, any>;
};

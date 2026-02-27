import { HotRessource } from "./HotDB";

export class BrutDataManager<Ressource extends object = object> implements HotRessource<Ressource> {
    private dataMap: Map<string, Ressource> = new Map();

    constructor(private readonly ressourceName: string) {
    }
    
    public async list(): Promise<string[]> {
        return Array.from(this.dataMap.keys());
    }

    public async set(key: string, value: Ressource): Promise<Ressource> {
        this.dataMap.set(key, value);
        return value;
    }

    public async get(key: string): Promise<Ressource | null> {
        return this.dataMap.get(key) ?? null;
    }
}
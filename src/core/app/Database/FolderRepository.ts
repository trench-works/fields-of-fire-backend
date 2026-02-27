import { ColdRessource } from "./ColdDB";


export class FolderRepository<Ressource extends object = object> implements ColdRessource<Ressource> {
    private dataMap: Map<string, Ressource> = new Map();

    constructor(private readonly ressourceName: string, ressources?: Record<string, Ressource>) {
        if (ressources) {
            for (const [key, ressource] of Object.entries(ressources)) {
                this.dataMap.set(key, ressource);
            }
        }
    }

    async list(): Promise<string[]> {
        return Array.from(this.dataMap.keys());
    }

    async get(key: string): Promise<Ressource | null> {
        return this.dataMap.get(key) ?? null;
    }
}
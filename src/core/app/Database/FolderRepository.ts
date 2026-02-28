import { ColdRessource } from "./ColdDB";


export abstract class FolderRepository<Ressource extends object = object, Entity extends object = Ressource> implements ColdRessource<Ressource> {
    private dataMap: Map<string, Entity> = new Map();

    constructor(private readonly ressourceName: string, ressources?: Record<string, Entity>) {
        if (ressources) {
            for (const [key, ressource] of Object.entries(ressources)) {
                this.dataMap.set(key, ressource);
            }
        }
    }

    async list(): Promise<string[]> {
        return Array.from(this.dataMap.keys());
    }

    abstract entityToRessource(entity: Entity): Ressource;

    async get(key: string): Promise<Ressource | null> {
        const entity = this.dataMap.get(key);
        if (!entity) {
            return null;
        }
        return this.entityToRessource(entity);
    }
}
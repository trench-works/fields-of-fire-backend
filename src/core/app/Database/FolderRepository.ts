import { ColdRessource } from "./ColdDB";

export abstract class FolderRepository<
    Ressource extends object = object,
    Entity extends object = Ressource,
> implements ColdRessource<Ressource> {
    private dataMap: Map<string, Entity> = new Map();

    constructor(
        private readonly ressourceName: string,
        ressources?: Record<string, Entity>
    ) {
        if (ressources) {
            for (const [key, ressource] of Object.entries(ressources)) {
                this.dataMap.set(key, ressource);
            }
        }
    }

    async list(): Promise<Ressource[]> {
        const data: Ressource[] = [];
        for (const entity of this.dataMap.values()) {
            data.push(
                JSON.parse(JSON.stringify(await this.entityToRessource(entity)))
            );
        }
        return data;
    }

    abstract entityToRessource(entity: Entity): Promise<Ressource>;

    async get(key: string): Promise<Ressource | undefined> {
        const entity = this.dataMap.get(key);
        if (!entity) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(await this.entityToRessource(entity)));
    }
}

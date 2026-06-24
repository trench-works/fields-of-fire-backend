import { ColdRessource } from "./ColdDB";
import * as fs from "fs";
export abstract class FolderRepository<
    Ressource extends object = object,
    Entity extends object = Ressource,
> implements ColdRessource<Ressource> {
    private dataMap: Map<string, Entity> = new Map();

    constructor(ressourceName: string, ressources?: Record<string, Entity>) {
        const data = JSON.parse(
            String(
                fs.readFileSync(
                    `${globalThis.rootdir}/json-data/${ressourceName}.json`
                )
            )
        );

        for (const element of data) {
            this.dataMap.set(element.id, element);
        }
        if (ressources) {
            for (const [key, element] of Object.entries(ressources)) {
                this.dataMap.set(key, element);
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

import { ColdRessource } from "./ColdDB";
import * as fs from "fs";
export abstract class FolderRepository<
    Ressource extends object = object,
    Entity extends object = Ressource,
> implements ColdRessource<Ressource> {
    private dataMap: Map<string, Entity> = new Map();

    constructor(ressourceName: string, ressources?: Record<string, Entity>) {
        this.loadJSON(ressourceName);
        if (ressources) {
            for (const [key, element] of Object.entries(ressources)) {
                this.dataMap.set(key, element);
            }
        }
    }

    private loadJSON(ressourceName: string) {
        try {
            const file = fs.lstatSync(
                `${globalThis.rootdir}/json-data/${ressourceName}`
            );
            if (file.isDirectory()) {
                this.loadJSONDirectory(
                    `${globalThis.rootdir}/json-data/${ressourceName}`
                );
            }
        } catch {}
        this.loadJSONFile(
            `${globalThis.rootdir}/json-data/${ressourceName}.json`
        );
    }

    private loadJSONDirectory(path: string) {
        const entries = fs.readdirSync(path, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                this.loadJSONDirectory(`${path}/${entry.name}`);
            } else if (entry.isFile()) {
                this.loadJSONFile(`${path}/${entry.name}`);
            }
        }
    }

    private async loadJSONFile(path: string) {
        try {
            if (fs.lstatSync(path).isFile()) {
                const data = JSON.parse(String(fs.readFileSync(path)));
                for (const element of data) {
                    this.dataMap.set(element.id, element);
                }
            }
        } catch {}
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

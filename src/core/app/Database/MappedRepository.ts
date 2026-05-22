import { HotRessource } from "./HotDB";

export class MappedRepository<
  Ressource extends object = object,
> implements HotRessource<Ressource> {
  private dataMap: Map<string, Ressource> = new Map();

  constructor(
    private readonly ressourceName: string,
    ressources?: Record<string, Ressource>,
  ) {
    if (ressources) {
      for (const [key, ressource] of Object.entries(ressources)) {
        this.dataMap.set(key, ressource);
      }
    }
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

import {
  ColdRessource,
  DBError,
  HttpController,
  Provide,
  HttpError,
  UnknownError,
} from "../../../core";
import { CharacterClass } from "../data/CharacterClass";
import { CharacterClassRepository } from "../data/CharacterClassRepository";

export class CharacterClassController extends HttpController {
  constructor(
    @Provide(CharacterClassRepository)
    private readonly repository: ColdRessource<CharacterClass>,
  ) {
    super();
    this.get("/class", this.getCharacterClasses.bind(this));
  }

  async getCharacterClasses(): Promise<CharacterClass[] | HttpError> {
    const data = await this.repository.list();
    if (data instanceof DBError) {
      return new UnknownError();
    }
    return data;
  }
}

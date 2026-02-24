import { Logger, Provide } from "../../../core";
import { GameDataManager } from "../../Game/data/GameDataManager";

export class PlayerActionService {
  constructor(
    @Provide(GameDataManager)
    private readonly gameDataManager: GameDataManager,
    @Provide("Logger") private readonly logger: Logger,
  ) {}

  action() {
    this.logger.log("PlayerActionService action method called");
  }
}

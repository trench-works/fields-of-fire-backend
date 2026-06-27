import { Provide, WsAwaiterManager, WsEventAwaiter } from "../../../core";
import { GameWebSocketManager } from "./GameWebSocketManager";

export class GameSubscriptionManager extends WsAwaiterManager {
    @Provide(GameWebSocketManager)
    private readonly gameSocket!: GameWebSocketManager;

    async onEvent(gameId: string, value: string): Promise<void> {
        super.onEvent(gameId, value);
        await this.onUpdate(gameId, (progress) =>
            this.gameSocket.emitConnectionUpdate(gameId, progress)
        );
    }

    async addAwaiter(gameId: string, awaiter: WsEventAwaiter): Promise<void> {
        console.log("addAwaiter");
        super.addAwaiter(gameId, awaiter);
        await this.onUpdate(gameId, (progress) =>
            this.gameSocket.emitConnectionUpdate(gameId, progress)
        );
    }
}

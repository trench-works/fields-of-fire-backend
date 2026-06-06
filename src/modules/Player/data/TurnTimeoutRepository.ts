const PLAYER_TIMEOUT = 30;

export class TurnTimeoutRepository {
    private readonly timersMap: Map<string, NodeJS.Timeout>;

    constructor() {
        this.timersMap = new Map();
    }

    async newTimeout(playerId: string, callback: () => void) {
        this.timersMap.set(
            playerId,
            setTimeout(() => {
                this.timersMap.delete(playerId);
                callback();
            }, PLAYER_TIMEOUT * 1000)
        );
    }

    async clearTimeout(playerId: string) {
        const timeout = this.timersMap.get(playerId);
        if (timeout) {
            clearTimeout(timeout);
        }
    }
}

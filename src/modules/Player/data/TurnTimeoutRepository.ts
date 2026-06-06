import { MappedRepository } from "../../../core";

const PLAYER_TIMEOUT = 30;

export class TurnTimeoutRepository extends MappedRepository<NodeJS.Timeout> {
    constructor() {
        super("turn-timeout");
    }

    async newTimeout(playerId: string, callback: () => void) {
        await this.set(
            playerId,
            setTimeout(() => {
                this.delete(playerId).then(callback);
            }, PLAYER_TIMEOUT * 1000)
        );
    }

    async clearTimeout(playerId: string) {
        const timeout = await this.get(playerId);
        if (timeout) {
            clearTimeout(timeout);
        }
    }
}

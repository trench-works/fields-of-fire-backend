import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
} from "../../../core";
import { Player } from "../../Player/data/Player";
import { Cell, Game, Plateau } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { Entity } from "../data/Entity";
import { LobbyDataManager } from "../../Lobby/data/LobbyDataManager";
import { v4 as uuidv4 } from "uuid";
import { Mob } from "../data/Mob";
import { JoinGameResponse } from "../application/interfaces/JoinGameResponse";

export class GameService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager,
        @Provide(LobbyDataManager)
        private readonly lobbyDataManager: LobbyDataManager
    ) {}

    async getPlayerCurrentGame(
        userId: string
    ): Promise<JoinGameResponse | null> {
        const game = (await this.gameDataManager.getAll()).find((game) =>
            game.players.some((player) => player.userId === userId)
        );
        if (!game) {
            return null;
        }
        const player = game.players.find((player) => player.userId === userId)!;
        const playerEntity = game.entities.find(
            (entity) => entity.entityId === player.entityId
        )!;
        return { game, player, playerEntity };
    }

    async createGameFromLobby(
        lobbyId: string,
        userId: string
    ): Promise<Game | SocketError> {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        if (lobby.creatorId !== userId) {
            return new AccessRefused();
        }
        const gameId = uuidv4();
        const plateau: Plateau = [];
        for (let x = 0; x < 10; x++) {
            const line: Cell[] = [];
            plateau.push(line);
            for (let y = 0; y < 10; y++) {
                line.push({ isHole: false, isWall: false });
            }
        }
        const npcsAndEntities: { npc: Mob; entity: Entity }[] = []; //TODO: do something random here
        for (let i = 0; i < 2; i++) {
            const entityId = uuidv4();
            npcsAndEntities.push({
                npc: {
                    entityId,
                    gameId,
                },
                entity: {
                    entityId,
                    position: { x: i, y: 4 }, //TODO: add something to randomize this and avoid superposition with empty or already occupied cells
                    characterClassId: "alliance_fantassin",
                },
            });
        }
        const entitiesAndPlayers: { player: Player; entity: Entity }[] =
            lobby.players.map((lobbyPlayer, i) => {
                const entityId = uuidv4();
                plateau[i][0].entityId = entityId;
                return {
                    player: {
                        playerId: lobbyPlayer.playerId,
                        userId: lobbyPlayer.userId,
                        entityId,
                        gameId,
                    },
                    entity: {
                        entityId,
                        position: { x: i, y: 0 }, //TODO: add something to randomize this and avoid superposition with empty or already occupied cells
                        characterClassId: lobbyPlayer.classId,
                    },
                };
            });
        const game: Game = {
            id: gameId,
            creatorId: userId,
            plateau: plateau,
            players: entitiesAndPlayers.map(({ player }) => player),
            npc: npcsAndEntities.map(({ npc }) => npc),
            entities: [
                ...entitiesAndPlayers.map(({ entity }) => entity),
                ...npcsAndEntities.map(({ entity }) => entity),
            ],
        };
        await this.lobbyDataManager.delete(lobbyId);
        return this.gameDataManager.set(gameId, game);
    }
}

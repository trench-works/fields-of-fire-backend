import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
    Id,
    LoggerService,
} from "../../../core";
import { Cell, Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { LobbyDataManager } from "../../Lobby/data/LobbyDataManager";
import { JoinGameResponse } from "../application/interfaces/JoinGameResponse";
import { Board } from "../data/Board";
import { Mob } from "../data/Mob";
import { Entity, EntityType } from "../data/Entity";
import { Player } from "../../Player/data/Player";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";

export class GameService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide("Logger")
    private readonly logger!: LoggerService;

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
        const gameId = Id.get();
        const plateau: Cell[][] = Board.getRandomPremade();
        const npcsAndEntities: { npc: Mob; entity: Entity }[] = []; //TODO: do something random here
        for (let i = 0; i < 2; i++) {
            const entityId = Id.get();
            plateau[i][5].entityId = entityId;
            npcsAndEntities.push({
                npc: {
                    entityId,
                    gameId,
                },
                entity: {
                    entityId,
                    position: { x: i, y: 5 }, //TODO: add something to randomize this and avoid superposition with empty or already occupied cells
                    classId: "alliance_fantassin",
                    entityType: EntityType.ENEMY,
                },
            });
        }
        const entitiesAndPlayers: { player: Player; entity: Entity }[] =
            lobby.players.map<{ player: Player; entity: Entity }>(
                (lobbyPlayer, i) => {
                    const entityId = Id.get();
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
                            classId: lobbyPlayer.classId,
                            entityType: EntityType.ALLY,
                        },
                    };
                }
            );
        const entities = [
            ...entitiesAndPlayers.map(({ entity }) => entity),
            ...npcsAndEntities.map(({ entity }) => entity),
        ];
        const classes = await this.classRepository.list();
        const game: Game = {
            id: gameId,
            creatorId: userId,
            plateau: plateau,
            players: entitiesAndPlayers.map(({ player }) => player),
            npc: npcsAndEntities.map(({ npc }) => npc),
            entities: entities.sort((entityA, entityB) => {
                const classA = classes.find(
                    (charClass) => charClass.id === entityA.classId
                )!;
                const classB = classes.find(
                    (charClass) => charClass.id === entityB.classId
                )!;
                return classA.stats.initiative < classB.stats.initiative
                    ? 1
                    : -1;
            }),
            playerTurns: entities
                .sort((entityA, entityB) => {
                    const classA = classes.find(
                        (charClass) => charClass.id === entityA.classId
                    )!;
                    const classB = classes.find(
                        (charClass) => charClass.id === entityB.classId
                    )!;
                    return classA.stats.initiative < classB.stats.initiative
                        ? 1
                        : -1;
                })
                .map((entity) => entity.entityId),
        };
        await this.lobbyDataManager.delete(lobbyId);
        return this.gameDataManager.set(gameId, game);
    }
}

import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
    Id,
    LoggerService,
    Ran,
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
import { GameCreationError } from "./errors/GameCreationError";
import { UserRepository } from "../../User/data/UserRepository";
import { GameWebSocketManager } from "../web/GameWebSocketManager";
import { BoostService } from "../../Player/services/BoostService";
import { Stats } from "../../Stat/data/Stats";

export class GameService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager!: LobbyDataManager;
    @Provide(CharacterClassRepository)
    private readonly classRepository!: CharacterClassRepository;
    @Provide("Logger")
    private readonly logger!: LoggerService;
    @Provide(UserRepository)
    private readonly userRepository!: UserRepository;
    @Provide(GameWebSocketManager)
    private readonly gameSocket!: GameWebSocketManager;
    @Provide(BoostService)
    private readonly boostService!: BoostService;

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
        const classes = await this.classRepository.list();

        const [mobs, mobsEntities] = await this.getMobs(
            gameId,
            plateau,
            2,
            0,
            lobby.players.length
        );

        const entitiesAndPlayers: { player: Player; entity: Entity }[] = [];
        this.logger.log(lobby.players);
        for (const lobbyPlayer of lobby.players) {
            const entityId = Id.get();
            const playerCell = await this.placeEntity(entityId, plateau, false);
            const user = await this.userRepository.get(lobbyPlayer.userId);
            const charClass = classes.find(
                (charClass) => charClass.id === lobbyPlayer.classId
            )!;
            entitiesAndPlayers.push({
                player: {
                    playerId: lobbyPlayer.playerId,
                    userId: lobbyPlayer.userId,
                    entityId,
                    gameId,
                    name: user?.username ?? charClass.name,
                },
                entity: {
                    entityId,
                    position: { ...playerCell.position },
                    classId: lobbyPlayer.classId,
                    entityType: EntityType.ALLY,
                    stats: charClass.stats,
                    effects: [],
                    permanentBoosts: {},
                    side: "player",
                    dead: false,
                },
            });
        }
        const entities = [
            ...entitiesAndPlayers.map(({ entity }) => entity),
            ...mobsEntities,
        ];
        const game: Game = {
            id: gameId,
            creatorId: userId,
            plateau: plateau,
            players: entitiesAndPlayers.map(({ player }) => player),
            npc: mobs,
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
            playerTurns: await this.getTurns(entities),
            readyPlayers: [],
            round: 1,
            isStopped: false,
        };
        await this.lobbyDataManager.delete(lobbyId);
        await this.gameDataManager.set(gameId, game);

        // const newPlayingPlayer = game.players.find( //FIXME: player turn timeout system is shitty and creating issues
        //     (player) => player.entityId === game.playerTurns[0]
        // )!;
        // this.turnTimeoutRepository.newTimeout(newPlayingPlayer.playerId, () =>
        //     this.playerActionService.finishTurn(
        //         game.id,
        //         newPlayingPlayer.playerId
        //     )
        // );

        return game;
    }

    private async placeEntity(
        entityId: string,
        plateau: Cell[][],
        isMob: boolean
    ): Promise<Cell> {
        const placementCells = plateau
            .flat()
            .filter((cell) =>
                !cell.entityId && isMob ? cell.isMobStart : cell.isPlayerStart
            );
        const placementCell = placementCells[Ran.int(placementCells.length)];
        if (!placementCell) {
            throw new GameCreationError();
        }
        placementCell.entityId = entityId;
        return placementCell;
    }

    private async getTurns(entities: Entity[]): Promise<string[]> {
        const classes = await this.classRepository.list();
        return entities
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
            .map((entity) => entity.entityId);
    }

    private async getMobs(
        gameId: string,
        plateau: Cell[][],
        mobCount: number,
        boostCount: number,
        playersCount: number
    ): Promise<[Mob[], Entity[]]> {
        //TODO: appliquer des boosts
        const classes = await this.classRepository.list();

        const npcs: Mob[] = [];
        const entities: Entity[] = [];

        for (let i = 0; i < mobCount; i++) {
            const entityId = Id.get();
            const mobCell = await this.placeEntity(entityId, plateau, true);
            // get a random mob class
            const mobClasses = classes.filter(
                (charClass) => !charClass.playable
            );
            const charClass = mobClasses[Ran.int(mobClasses.length)];
            npcs.push({
                entityId,
                gameId,
            });

            const entity: Entity = {
                entityId,
                position: { ...mobCell.position },
                classId: charClass.id,
                entityType: EntityType.ENEMY,
                stats: charClass.stats,
                effects: [],
                side: "mob",
                dead: false,
            };

            const boosts = await this.boostService.getMobBoost(
                playersCount,
                mobCount,
                boostCount
            );
            for (const boost of boosts) {
                if (boost.id === "reinforcement") {
                    mobCount++;
                } else {
                    await this.boostService.applyBoost(entity, boost.id);
                }
            }
            entities.push(entity);
        }

        return [npcs, entities];
    }

    async newGameFromGame(gameId: string) {
        const game = (await this.gameDataManager.get(gameId))!;

        game.readyPlayers = [];
        for (const line of game.plateau) {
            for (const cell of line) {
                cell.entityId = undefined;
            }
        }
        for (const npc of game.npc) {
            const entityIndex = game.entities.findIndex(
                (entity) => entity.entityId === npc.entityId
            );
            game.entities.splice(entityIndex, 1);
        }
        const [npcs, mobsEntities] = await this.getMobs(
            game.id,
            game.plateau,
            2,
            game.round,
            game.players.length
        );
        game.npc = npcs;
        game.entities.push(...mobsEntities);

        for (const player of game.players) {
            const entity = game.entities.find(e => e.entityId === player.entityId)!;
            const charClass = await this.classRepository.get(entity.classId);
            
            // Réinitialise aux stats de base + permanentBoosts uniquement
            entity.stats = Stats.add(charClass!.stats, entity.permanentBoosts as Stats ?? {});
            entity.effects = entity.effects.filter(e => e.duration === null); // garde les effets permanents
            
            const playerCell = await this.placeEntity(entity.entityId, game.plateau, false);
            entity.position = { ...playerCell.position };
        }

        game.playerTurns = await this.getTurns(game.entities);
        game.round++;
        game.isStopped = false;

        await this.gameDataManager.set(gameId, game);
        await this.gameSocket.emitGameRenew(game);
    }
}

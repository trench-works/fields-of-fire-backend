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
        const npcsAndEntities: { npc: Mob; entity: Entity }[] = [];
        const classes = await this.classRepository.list();
        for (let i = 0; i < 2; i++) {
            const entityId = Id.get();
            const mobCells = plateau
                .flat()
                .filter((cell) => !cell.entityId && cell.isMobStart);
            const mobCell = mobCells[Ran.int(mobCells.length)];
            if (!mobCell) {
                return new GameCreationError();
            }
            mobCell.entityId = entityId;
            // get a random mob class
            const mobClasses = classes.filter(
                (charClass) => !charClass.playable
            );
            const charClass = mobClasses[Ran.int(mobClasses.length)];
            npcsAndEntities.push({
                npc: {
                    entityId,
                    gameId,
                },
                entity: {
                    entityId,
                    position: { ...mobCell.position },
                    classId: charClass.id,
                    entityType: EntityType.ENEMY,
                    stats: charClass.stats,
                    effects: [],
                    side: "mob",
                    dead: false,
                },
            });
        }
        const entitiesAndPlayers: { player: Player; entity: Entity }[] = [];
        this.logger.log(lobby.players);
        for (const lobbyPlayer of lobby.players) {
            const entityId = Id.get();
            const playerCells = plateau
                .flat()
                .filter((cell) => !cell.entityId && cell.isPlayerStart);
            const playerCell = playerCells[Ran.int(playerCells.length)];
            if (!playerCell) {
                throw new GameCreationError();
            }
            const user = await this.userRepository.get(lobbyPlayer.userId);
            playerCell.entityId = entityId;
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
                    side: "player",
                    dead: false,
                },
            });
        }
        const entities = [
            ...entitiesAndPlayers.map(({ entity }) => entity),
            ...npcsAndEntities.map(({ entity }) => entity),
        ];
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
            readyPlayers: [],
            round: 1,
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

    async newGameFromGame(gameId: string) {
        const game = (await this.gameDataManager.get(gameId))!;

        game.readyPlayers = [];
        //TODO: supprimer les entités qui correspondent aux mobs
        game.npc = [];
        //TODO: générer des nouveaux mobs
        //TODO: leur appliquer x boots selon le round game.round

        //TODO: changer la position des joueurs pour les rmeettre sur des cases de spawn

        game.playerTurns = [];
        //TODO: recompléter le playerTurns

        game.round++;

        await this.gameDataManager.set(gameId, game);
        await this.gameSocket.emitGameRenew(game);
    }
}

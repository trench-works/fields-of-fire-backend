import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
    Id,
    LoggerService,
    Ran,
    WsEventAwaiter,
} from "../../../core";
import { Cell, Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { LobbyDataManager } from "../../Lobby/data/LobbyDataManager";
import { JoinGameResponse } from "../application/interfaces/JoinGameResponse";
import { Entity, EntityType } from "../data/Entity";
import { Player } from "../../Player/data/Player";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { GameCreationError } from "./errors/GameCreationError";
import { UserRepository } from "../../User/data/UserRepository";
import { GameWebSocketManager } from "../web/GameWebSocketManager";
import { BoostService } from "../../Player/services/BoostService";
import { Team, TeamColor, TeamName } from "../data/Team";
import { NPC } from "../data/NPC";
import { LobbyOutputActions } from "../../Lobby/application/interfaces/LobbyAction";
import { LobbyWebSocketManager } from "../../Lobby/web/LobbyWebSocketManager";
import { MobService } from "../../Player/services/MobService";
import { GameSubscriptionManager } from "../web/GameSubscriptionManager";
import { MapService } from "./MapService";

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
    @Provide(LobbyWebSocketManager)
    private readonly lobbySocket!: LobbyWebSocketManager;
    @Provide("MobService")
    private readonly mobService!: MobService;
    @Provide(GameSubscriptionManager)
    private readonly gameSubscribeAwaiters!: GameSubscriptionManager;
    @Provide(MapService)
    private readonly mapService!: MapService;

    async getPlayerCurrentGame(
        userId: string
    ): Promise<JoinGameResponse | null> {
        const game = (await this.gameDataManager.findAll()).find((game) =>
            game.players.some((player) => player.userId === userId)
        );
        if (!game) {
            return null;
        }
        const player = game.players.find((player) => player.userId === userId)!;
        const playerEntity = game.entities.find(
            (entity) => entity.id === player.entityId
        )!;
        return { game, player, playerEntity };
    }

    async createGameFromLobby(
        lobbyId: string,
        userId: string
    ): Promise<void | SocketError> {
        const lobby = await this.lobbyDataManager.getLobby(lobbyId);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        if (lobby.creatorId !== userId) {
            return new AccessRefused();
        }
        const gameId = Id.get();
        const plateau: Cell[][] = this.mapService.generateRandomMap({
            width: 10,
            height: 10,
        });
        const classes = await this.classRepository.list();

        const playersTeam: Team = {
            id: Id.get(),
            name: TeamName.PLAYERS,
            color: TeamColor.BLUE,
            playerIds: [],
            npcIds: [],
            entitiesIds: [],
        };
        const mobsTeam: Team = {
            id: Id.get(),
            name: TeamName.MOBS,
            color: TeamColor.ROUGE,
            playerIds: [],
            npcIds: [],
            entitiesIds: [],
        };
        const [mobs, mobsEntities] = await this.getMobs(
            gameId,
            plateau,
            2,
            0,
            lobby.players.length,
            mobsTeam
        );
        const playersEntities: Entity[] = [];
        const players: Player[] = [];
        this.logger.log(lobby.players);
        for (const lobbyPlayer of lobby.players) {
            const entityId = Id.get();
            const playerCell = await this.placeEntity(entityId, plateau);
            const user = await this.userRepository.get(lobbyPlayer.userId);
            const charClass = classes.find(
                (charClass) => charClass.id === lobbyPlayer.classId
            )!;
            players.push({
                id: lobbyPlayer.playerId,
                userId: lobbyPlayer.userId,
                entityId,
                gameId,
                name: user?.username ?? charClass.name,
                invocations: [],
                randomBoost: [],
            });
            playersEntities.push({
                id: entityId,
                teamId: playersTeam.id,
                controllerId: lobbyPlayer.playerId,
                position: { ...playerCell.position },
                classId: lobbyPlayer.classId,
                type: EntityType.PLAYER,
                stats: charClass.stats,
                effects: [],
                dead: false,
                isInvocation: false,
                isPlaying: charClass.isPlaying,
            });
            playersTeam.entitiesIds.push(entityId);
            playersTeam.playerIds.push(lobbyPlayer.playerId);
        }
        const entities = [...playersEntities, ...mobsEntities];
        const game: Game = {
            id: gameId,
            mode: lobby.mode,
            creatorId: userId,
            plateau: plateau,
            players: players,
            npc: mobs,
            entities: entities.sort((entityA, entityB) => {
                return entityA.stats.initiative < entityB.stats.initiative
                    ? 1
                    : -1;
            }),
            teams: [playersTeam, mobsTeam],
            playerTurns: await this.getTurns(entities),
            readyPlayers: [],
            round: 1,
            isStopped: false,
            playerWin: false,
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

        const playersSubscribedAwaiter = new WsEventAwaiter(
            game.players.map((player) => player.id)
        );
        this.gameSubscribeAwaiters.addAwaiter(
            game.id,
            playersSubscribedAwaiter
        );
        await this.lobbySocket.emit<Game>({
            actionId: LobbyOutputActions.START,
            key: { lobbyId },
            payload: game,
        });

        // Wait for all players to be subscribed before doing anything else
        const firstPlayingEntity = game.entities.find(
            (entity) => entity.id === game.playerTurns[0]
        )!;
        if (firstPlayingEntity?.type === EntityType.NPC) {
            console.log("ATTENDRE L4INSCRIPTION");
            playersSubscribedAwaiter.promise.then(async () => {
                new Promise((resolve) => setTimeout(resolve, 3000)).then(() =>
                    this.mobService.play(gameId)
                );
            });
        }
    }

    private async placeEntity(
        entityId: string,
        plateau: Cell[][]
    ): Promise<Cell> {
        const placementCells = plateau
            .flat()
            .filter((cell) => !cell.entityId && cell.isStart);
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
            .filter((entity) => entity.isPlaying)
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
            .map((entity) => entity.id);
    }

    private async getMobs(
        gameId: string,
        plateau: Cell[][],
        mobCount: number,
        boostCount: number,
        playersCount: number,
        team: Team
    ): Promise<[NPC[], Entity[]]> {
        const classes = await this.classRepository.list();

        const npcs: NPC[] = [];
        const entities: Entity[] = [];

        for (let i = 0; i < mobCount; i++) {
            const entityId = Id.get();
            const mobCell = await this.placeEntity(entityId, plateau);
            // get a random mob class
            const mobClasses = classes.filter(
                (charClass) => !charClass.playable && charClass.isPlaying
            );
            const charClass = mobClasses[Ran.int(mobClasses.length)];
            const npc: NPC = {
                id: Id.get(),
                entityId,
                gameId,
            };
            team.npcIds.push(npc.id);
            npcs.push(npc);

            const entity: Entity = {
                id: entityId,
                teamId: team.id,
                controllerId: npc.id,
                position: { ...mobCell.position },
                classId: charClass.id,
                type: EntityType.NPC,
                stats: charClass.stats,
                effects: [],
                dead: false,
                isInvocation: false,
                isPlaying: charClass.isPlaying,
            };
            team.entitiesIds.push(entity.id);

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
                    entity.stats.energy = entity.stats.totalEnergy;
                    entity.stats.mouvement = entity.stats.totalMouvement;
                }
            }
            entities.push(entity);
        }

        return [npcs, entities];
    }

    async newGameFromGame(gameId: string) {
        const game = (await this.gameDataManager.get(gameId))!;

        game.readyPlayers = [];
        game.entities = game.entities.filter((entity) => !entity.isInvocation);
        game.plateau = this.mapService.generateRandomMap({
            width: 10,
            height: 10,
        });
        const mobsTeam = game.teams.find(
            (team) => team.name === TeamName.MOBS
        )!;
        // Delete NPCs and Entities
        const currentNpcLength = game.npc.length;
        for (const npcId of mobsTeam.npcIds) {
            const npcIndex = game.npc.findIndex((npc) => npc.id === npcId);
            game.npc.splice(npcIndex, 1);
        }
        for (const entityId of mobsTeam.entitiesIds) {
            const entityIndex = game.entities.findIndex(
                (entity) => entity.id === entityId
            );
            game.entities.splice(entityIndex, 1);
        }
        // Create new Mobs and Entities
        const [npcs, mobsEntities] = await this.getMobs(
            game.id,
            game.plateau,
            currentNpcLength,
            game.round,
            game.players.length,
            mobsTeam
        );
        mobsTeam.npcIds = npcs.map((npc) => npc.id);
        mobsTeam.entitiesIds = mobsEntities.map((entity) => entity.id);
        game.npc.push(...npcs);
        game.entities.push(...mobsEntities);

        for (const player of game.players) {
            const entity = game.entities.find((e) => e.id === player.entityId)!;
            entity.effects = entity.effects.filter((e) => e.duration === null); // garde les effets permanents
            entity.stats.energy = entity.stats.totalEnergy;
            entity.stats.mouvement = entity.stats.totalMouvement;

            const playerCell = await this.placeEntity(entity.id, game.plateau);
            entity.position = { ...playerCell.position };
        }

        game.playerTurns = await this.getTurns(game.entities);
        game.round++;
        game.isStopped = false;

        game.entities = game.entities.sort((entityA, entityB) => {
            return entityA.stats.initiative < entityB.stats.initiative ? 1 : -1;
        });
        await this.gameDataManager.set(gameId, game);
        await this.gameSocket.emitGameRenew(game);

        // Wait for all players to be subscribed before doing anything else
        const firstPlayingEntity = game.entities.find(
            (entity) => entity.id === game.playerTurns[0]
        )!;
        if (firstPlayingEntity?.type === EntityType.NPC) {
            this.mobService.play(gameId);
        }
    }
}

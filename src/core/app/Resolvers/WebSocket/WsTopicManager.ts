import { WsController, Logger, TokenService } from "../..";
import { WebSocket } from "ws";
import { ValidationError } from "class-validator";
import { InputAction } from "../../../types/Action";

type SubcribePayload<RessourceKeyObject> = {
    key: RessourceKeyObject;
};

export class WsTopicManager<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RessourceKeyObject extends Record<string, unknown> = any,
> {
    constructor(
        private readonly controllers: WsController<RessourceKeyObject>[],
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
        private readonly topic: string
    ) {}

    open(socket: WebSocket) {
        socket.on("message", async (rawData: string) => {
            const {
                actionId,
                token,
                payload,
            }: InputAction<SubcribePayload<RessourceKeyObject>> =
                JSON.parse(rawData);
            if (actionId === "subscribe") {
                await this.subscribe(socket, token, payload);
            }
        });
    }

    async subscribe(
        socket: WebSocket,
        rawToken: string,
        payload: SubcribePayload<RessourceKeyObject>
    ) {
        const token = this.tokenService.decode(rawToken);
        if (token instanceof Error) {
            socket.close(4000, "TOKEN INVALID");
            return;
        }

        const validations = this.controllers.map((controller) =>
            controller.subscribe(socket, { key: payload.key, token })
        );
        const errors = await Promise.all(validations);

        const validation = errors
            .filter((errors): errors is ValidationError[] =>
                Boolean(errors?.length)
            )
            .flat();

        if (validation.length === this.controllers.length) {
            this.logger.error(
                "ERROR ON IN EVENT, NO MATCHING ENTRYPOINT FOR KEY"
            );
            socket.close(1008, "WRONG DATA"); //TODO: custom error message when no key matching
            return;
        }
    }
}

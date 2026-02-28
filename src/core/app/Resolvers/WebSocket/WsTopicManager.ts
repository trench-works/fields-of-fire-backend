import { WsController, Logger } from "../..";
import { WebSocket } from "ws";
import { UserInfos } from "../../Types/UserInfos";
import { validateSync, ValidationError } from "class-validator";
import { InputAction } from "../../../types/Action";

type SubcribePayload<RessourceKeyObject> = {
    key: RessourceKeyObject;
    user: UserInfos;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class WsTopicManager<RessourceKeyObject extends Record<string, unknown> = {}> {
    constructor(
        private readonly controllers: WsController<RessourceKeyObject>[],
        private readonly logger: Logger
    ) {}

    open(socket: WebSocket) {
        socket.on("message", (rawData: string) => {
            const { actionId, payload }: InputAction<SubcribePayload<RessourceKeyObject>> =
                JSON.parse(rawData);
            if (actionId === "subscribe") {
                this.subscribe(socket, payload);
            }
        });
    }

    subscribe(socket: WebSocket, payload: SubcribePayload<RessourceKeyObject>) {
        const user = new UserInfos();
        Object.assign(user, payload.user);
        const validateUser = validateSync(user);
        //TODO: verify as well that user is authenticated and authorized
        if (validateUser?.length) {
            socket.close(0, JSON.stringify(validateUser));
        }

        const validation = this.controllers
            .map((controller) =>
                controller.subscribe(socket, { key: payload.key, user })
            )
            .filter((errors): errors is ValidationError[] =>
                Boolean(errors?.length)
            )
            .flat();

        if (validation.length === this.controllers.length) {
            this.logger.error("ERROR ON IN EVENT, NO MATCHING ENTRYPOINT FOR KEY");
            socket.close(1008, "WRONG DATA"); //TODO: custom error message when no key matching
        }
    }
}

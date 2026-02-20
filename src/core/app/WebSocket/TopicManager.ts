import { Controller } from "..";
import { WebSocket } from "ws";
import { UserInfos } from "../Types/UserInfos";
import { validateSync, ValidationError } from "class-validator";
import { InputAction } from "../../types/Action";

type SubcribePayload = { key: any; user: UserInfos };

export class TopicManager {
    constructor(
        public readonly topic: string,
        private readonly controllers: Controller[]
    ) {}

    open(socket: WebSocket) {
        socket.on("message", (rawData: string) => {
            const { actionId, payload }: InputAction<SubcribePayload> =
                JSON.parse(rawData);
            if (actionId === "subscribe") {
                this.subscribe(socket, payload);
            }
        });
    }

    subscribe(socket: WebSocket, payload: SubcribePayload) {
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
            socket.close(1, JSON.stringify(validation)); //TODO: custom error message when no key matching
        }
    }
}

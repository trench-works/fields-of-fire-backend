import { Controller } from ".";
import { WebSocket } from "ws";
import { UserInfos } from "./interfaces/UserInfos";
import { validateSync, ValidationError } from "class-validator";
import { InputAction } from "../types/Action";

type SubcribePayload = { key: any; user: UserInfos };

export class TopicManager {
    constructor(
        public readonly topic: string,
        private readonly controllers: Controller[]
    ) {}

    open(socket: WebSocket) {
        socket.on(
            "message",
            ({ actionId, payload }: InputAction<SubcribePayload>) =>
                actionId === "subscribe" && this.subscribe(socket, payload)
        );
    }

    subscribe(socket: WebSocket, { key, user }: { key: any; user: UserInfos }) {
        console.log("trying to connect", JSON.stringify(key));
        const validateUser = validateSync(user);
        console.log("user data validated", JSON.stringify(validateUser));
        //TODO: verify as well that user is authenticated and authorized
        if (validateUser?.length) {
            socket.close(0, JSON.stringify(validateUser));
        }

        const validation = this.controllers
            .map((controller) => controller.subscribe(socket, { key, user }))
            .filter((errors): errors is ValidationError[] =>
                Boolean(errors?.length)
            )
            .flat();

        if (validation.length === this.controllers.length) {
            socket.close(1, JSON.stringify(validation)); //TODO: custom error message when no key matching
        }
    }
}

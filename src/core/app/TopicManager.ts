import { Controller } from ".";
import { WebSocket } from "ws";
import {Request} from "express";
import { UserInfos } from "./interfaces/UserInfos";
import { validateSync, ValidationError } from "class-validator";



export class TopicManager {

    constructor(public readonly topic: string, private readonly controllers: Controller[]){}

    subscribe(
        socket: WebSocket, 
        request: Request<{}, {}, { key: any; user: UserInfos }>
    ) {
        const validateUser = validateSync(request.body.user);
        if(validateUser?.length) {
            socket.send(validateUser);
        }

        const validation = this.controllers
            .map((controller) => controller.subscribe(socket, request))
            .filter((errors): errors is ValidationError[] => Boolean(errors?.length))
            .flat();
        
        if(validation.length === this.controllers.length) {
            socket.close(1, JSON.stringify(validation));
        } else {
            socket.send(validation);
        }

    }
}
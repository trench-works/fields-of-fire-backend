import { OnFunctionParam, OnHandler } from "../types/OnEvent";
import { RawData } from "ws";

export type ControllerProps = {
    path: string;
};

export class Controller {
    public onHandlers: OnHandler[];

    constructor(private readonly config: ControllerProps) {
        this.onHandlers = [];
    }

    get path(): string {
        return this.config.path;
    }

    on(listener: (message: string) => void): this {
        this.onHandlers.push({ event: "message", listener: listener as any });
        return this;
    }

    mount() {}
}

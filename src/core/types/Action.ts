import { SocketError } from "../errors";

export type InputAction<PayloadObject extends object = object> = {
    actionId: string;
    payload: PayloadObject;
};

export type MultipleClientsOutputAction<
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    RessourceKeyObject extends Record<string, unknown> = {},
    OutputActions = string,
    PayloadObject extends object = object
> = {
    actionId: OutputActions;
    key: Partial<RessourceKeyObject>;
    payload: PayloadObject;
};

export type SingleClientOutputAction<
    PayloadObject extends object = object,
    OutputActions = string
> = {
    actionId: OutputActions | "error";
    payload: PayloadObject | SocketError;
} | {
    actionId: "error";
    payload: SocketError;
};

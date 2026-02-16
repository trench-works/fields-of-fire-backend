import { UserInfos } from "../app/interfaces/UserInfos";

export type InputAction<
    RessourceKeyObject extends Record<string, any> = {},
    PayloadObject extends object = any
> = {
    actionId: string;
    key?: RessourceKeyObject;
    payload: PayloadObject;
    user: UserInfos;
};

export type MultipleClientsOutputAction<
    RessourceKeyObject extends Record<string, any> | undefined = undefined,
    PayloadObject extends object = any
> = {
    actionId: string;
    key: RessourceKeyObject extends undefined
        ? undefined
        : Partial<RessourceKeyObject>;
    payload: PayloadObject;
};

export type SingleClientOutputAction<PayloadObject extends object = any> = {
    actionId: string;
    payload: PayloadObject;
};

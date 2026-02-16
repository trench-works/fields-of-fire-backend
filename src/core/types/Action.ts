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

export type OutputAction<
    RessourceKeyObject extends Record<string, any> = {},
    PayloadObject extends object = any
> = {
    actionId: string;
    key?: RessourceKeyObject;
    payload: PayloadObject;
};

import { UserInfos } from "../app/interfaces/UserInfos";

export type Action<
    RessourceKeyObject extends Record<string, any> = {},
    PayloadObject extends object = any
> = {
    actionId: string;
    key?: RessourceKeyObject;
    payload: PayloadObject;
    user: UserInfos;
};

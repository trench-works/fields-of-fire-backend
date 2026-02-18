export type InputAction<PayloadObject extends object = any> = {
    actionId: string;
    payload: PayloadObject;
};

export type MultipleClientsOutputAction<
    RessourceKeyObject extends Record<string, any> | undefined = undefined,
    OutputActions = string,
    PayloadObject extends object = any
> = {
    actionId: OutputActions;
    key: RessourceKeyObject extends undefined
        ? undefined
        : Partial<RessourceKeyObject>;
    payload: PayloadObject;
};

export type SingleClientOutputAction<
    PayloadObject extends object = any,
    OutputActions = string
> = {
    actionId: OutputActions | "error";
    payload: PayloadObject;
};

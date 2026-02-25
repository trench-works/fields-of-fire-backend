export interface AsyncProvided {
    asyncProvide(...providers: object[]): void;
}

export const isAsyncProvided = (provider: object): provider is AsyncProvided => {
    return "asyncProvide" in provider;
};

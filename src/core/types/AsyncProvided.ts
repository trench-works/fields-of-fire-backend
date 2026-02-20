export interface AsyncProvided {
    asyncProvide(...providers: any[]): void;
}

export const isAsyncProvided = (provider: any): provider is AsyncProvided => {
    return "asyncProvide" in provider;
};

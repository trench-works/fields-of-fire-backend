import { Provider } from "./Provider";

export interface AsyncProvided {
    asyncProvide(...providers: Provider[]): void;
}

export const isAsyncProvided = (
    provider: Provider
): provider is AsyncProvided => {
    return "asyncProvide" in provider;
};

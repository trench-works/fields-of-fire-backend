import { Provider } from "./Provider";

export interface AsyncProvider {
    asyncProvide(...providers: Provider[]): void;
}

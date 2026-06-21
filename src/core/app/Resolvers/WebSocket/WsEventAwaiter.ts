export class WsEventAwaiter {
    protected resolve: () => void;
    public promise: Promise<void>;
    protected registered: string[];

    constructor(private readonly expectedRegistration: string[]) {
        this.resolve = () => {
            console.log("FALSE RESOLVER !");
        };
        this.promise = new Promise<void>((resolve) => {
            this.resolve = resolve;
        });
        this.registered = [];
    }

    registerEvent(id: string): boolean {
        if (
            !this.registered.includes(id) &&
            this.expectedRegistration.includes(id)
        ) {
            this.registered.push(id);
        }
        if (this.expectedRegistration.length === this.registered.length) {
            this.resolve();
            return true;
        }
        return false;
    }
}

export class WsAwaiterManager {
    protected awaiters: Map<string, WsEventAwaiter>;

    constructor() {
        this.awaiters = new Map();
    }

    addAwaiter(key: string, awaiter: WsEventAwaiter) {
        this.awaiters.set(key, awaiter);
    }

    onEvent(key: string, value: string) {
        const awaiter = this.awaiters.get(key);
        if (awaiter) {
            const finished = awaiter.registerEvent(value);
            if (finished) {
                this.awaiters.delete(key);
            }
        }
    }
}

export class WsEventAwaiter {
    protected resolve: () => void;
    public promise: Promise<void>;
    protected registered: string[];

    protected listeners: ((value: number) => void)[];

    constructor(private readonly expectedRegistration: string[]) {
        this.resolve = () => {
            console.log("FALSE RESOLVER !");
        };
        this.promise = new Promise<void>((resolve) => {
            this.resolve = resolve;
        });
        this.registered = [];
        this.listeners = [];
    }

    onUpdate(listener: (value: number) => void): void {
        this.listeners.push(listener);
    }

    registerEvent(id: string): boolean {
        if (
            !this.registered.includes(id) &&
            this.expectedRegistration.includes(id)
        ) {
            this.registered.push(id);
        }

        const progress =
            this.registered.length / this.expectedRegistration.length;
        this.listeners.forEach((listener) => listener(progress));

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

    async onUpdate(
        key: string,
        listener: (value: number) => Promise<void>
    ): Promise<void> {
        const awaiter = this.awaiters.get(key);
        if (!awaiter) {
            await listener(1);
            return;
        }
        awaiter.onUpdate(listener);
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

export type LockListener = () => void;

export class DataLocker {
    protected locked: Map<string, LockListener[]>;

    constructor() {
        this.locked = new Map();
    }

    lock(key: string) {
        const locker = this.locked.get(key);
        if (!locker) {
            this.locked.set(key, []);
        }
    }

    unlock(key: string) {
        const locker = this.locked.get(key);
        if (!locker) {
            return;
        }
        if (locker.length === 0) {
            this.locked.delete(key);
            return;
        }
        const listener = locker.shift();
        listener?.();
        if (locker.length === 0) {
            this.locked.delete(key);
        } else {
            this.locked.set(key, locker);
        }
    }

    async waitLock(key: string): Promise<void> {
        const locker = this.locked.get(key);
        if (!locker) {
            return;
        }
        return new Promise((resolve) => {
            locker.push(resolve);
            this.locked.set(key, locker);
        });
    }
}

export class MyObject {
    public static keys<T extends object>(object: T) {
        return Object.keys(object) as (keyof T)[];
    }

    public static deepClone<T extends object>(object: T): T {
        return JSON.parse(JSON.stringify(object));
    }
}

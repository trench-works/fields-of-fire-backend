export class MyMath {
    public static sum: {
        (a: number, ...add: number[]): number;
        (add: number[]): number;
    } = (a: number | number[], ...add: number[]): number => {
        const toAdd = Array.isArray(a) ? [...a, ...add] : [a, ...add];
        return toAdd.reduce((a, b) => a + b, 0);
    };
}

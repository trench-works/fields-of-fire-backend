// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MultiPlexedArray = [...any];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataToMultiPlex = any[][];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComposedElement = { [x: string]: any };

export abstract class MultiPlexer<
    Arr extends MultiPlexedArray,
    T extends ComposedElement,
> {
    protected readonly data: DataToMultiPlex;
    protected multiPlexedData: T[];

    constructor(...data: DataToMultiPlex) {
        this.data = data;
        this.multiPlexedData = [];
    }

    protected resolveMultiplexion(
        multiPlexedArray: Arr,
        dataToMultiplex: DataToMultiPlex
    ) {
        if (dataToMultiplex.length) {
            const toMultiplex = dataToMultiplex[0];
            for (const value of toMultiplex) {
                this.resolveMultiplexion(
                    [...multiPlexedArray, value] as unknown as Arr,
                    dataToMultiplex.slice(1)
                );
            }
        } else {
            this.multiPlexedData.push(
                this.getComposedElement(multiPlexedArray)
            );
        }
    }

    multiplex(): this {
        if (!this.data.length) {
            return this;
        }
        this.multiPlexedData = [];
        this.resolveMultiplexion([] as unknown as Arr, this.data);
        return this;
    }

    getMultiplexedData(): T[] {
        return this.multiPlexedData;
    }

    abstract getComposedElement(data: Arr): T;
}

export type Evaluation<Evaluated extends object> = {
    note: number;
    evaluated: Evaluated;
};

export abstract class Evaluator<T extends object, Evaluated extends object> {
    evaluations: Evaluation<Evaluated>[];

    constructor(public readonly values: T[]) {
        this.evaluations = [];
    }

    async evaluate(): Promise<this> {
        this.evaluations = [];
        await Promise.all(
            this.values.map((value) =>
                this.evaluateValue(value, (evaluation) =>
                    this.evaluations.push(evaluation)
                )
            )
        );
        return this;
    }

    getBest(): Evaluated | null {
        let best = null;
        for (const value of this.evaluations) {
            if (!best || value.note > best.note) {
                best = value;
            }
        }
        return best?.evaluated ?? null;
    }

    protected abstract evaluateValue(
        value: T,
        pushEvaluation: (evaluation: Evaluation<Evaluated>) => void
    ): Promise<void>;
}

export abstract class Evaluator<T = object> {
    values: Map<string, T>;
    evaluations: Map<string, number>;

    constructor(values: T[]) {
        this.values = new Map();
        this.evaluations = new Map();

        for (const value of values) {
            const key = this.getKey(value);
            this.values.set(key, value);
        }
    }

    evaluate(): this {
        for (const [key, value] of this.values.entries()) {
            const evaluation = this.getEvaluation(value);
            this.evaluations.set(key, evaluation);
        }
        return this;
    }

    getBest(): T | null {
        let bestKey = null;
        let best = 0;
        for (const [key, value] of this.evaluations.entries()) {
            if (value > best) {
                best = value;
                bestKey = key;
            }
        }
        if (bestKey) {
            return this.values.get(bestKey) ?? null;
        }
        return null;
    }

    protected abstract getKey(value: T): string;
    protected abstract getEvaluation(value: T): number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvaluatedArray = [...any];

export abstract class EvaluationsJoiner<T extends EvaluatedArray> {
    protected readonly evaluators: Evaluator[];

    constructor(...evaluators: Evaluator[]) {
        this.evaluators = evaluators;
    }

    protected resolveEvaluationCase(evaluated: T, evaluators: Evaluator[]) {
        if (this.evaluators.length) {
            const evaluator = evaluators[0];
            for (const [key, value] of evaluator.values.entries()) {
                this.resolveEvaluationCase(
                    [...evaluated, value] as unknown as T,
                    evaluators.slice(1)
                );
            }
        } else {
            const evaluation = this.getEvaluation(evaluated);
        }
    }

    evaluate(): this {
        if (!this.evaluators.length) {
            return this;
        }
        this.resolveEvaluationCase([] as unknown as T, this.evaluators);
        return this;
    }

    abstract getEvaluation(evaluated: T): number;
}

// Mastery/application/MasteryHttpController.ts
import { DBError, HttpController, HttpError, Provide, UnknownError } from "../../../core";
import { MasteryTreeRepository } from "../repository/MasteryTreeRepository";
import { MasteryTree } from "../data/Mastery";

export class MasteryController extends HttpController {
    constructor(
        @Provide(MasteryTreeRepository)
        private readonly repository: MasteryTreeRepository,
    ) {
        super();
        this.get("/masteries", this.getMasteries.bind(this));
    }

    async getMasteries(): Promise<MasteryTree[] | HttpError> {
        const data = await this.repository.list();
        if (data instanceof DBError) {
            return new UnknownError();
        }
        return data;
    }
}
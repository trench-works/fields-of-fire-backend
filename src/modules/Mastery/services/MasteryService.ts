import { Entity } from "../../Game/data/Entity";
import { Stats } from "../../Stat/data/Stats";
import { Mastery, MasterySelection, MasteryTree } from "../data/Mastery";

export class MasteryService {

    private collect(tree: MasteryTree): Map<string, Mastery> {
        const all = new Map<string, Mastery>();
        const visit = (m: Mastery) => {
            all.set(m.id, m);
            m.subMasteries?.forEach(visit);
        };
        if (tree.rootMastery) visit(tree.rootMastery);
        tree.masteries.forEach(visit);
        return all;
    }

    /** Renvoie un message d'erreur, ou undefined si la sélection est valide. */
    validate(
        tree: MasteryTree,
        selection: MasterySelection,
        availablePoints = Infinity,
    ): string | undefined {
        const byId = this.collect(tree);
        const levelOf = (id: string) => selection[id] ?? 0;

        for (const [id, level] of Object.entries(selection)) {
            const mastery = byId.get(id);
            if (!mastery) return `Unknown mastery ${id}`;
            if (!Number.isInteger(level) || level < 1 || level > mastery.maxLevel) {
                return `Invalid level for ${id}`;
            }
        }

        const spent = Object.values(selection).reduce((sum, l) => sum + l, 0);
        if (spent > availablePoints) return "Not enough mastery points";

        for (const id of Object.keys(selection)) {
            const mastery = byId.get(id)!;
            for (const req of mastery.masteryRequirements ?? []) {
                if (levelOf(req.masteryId) < req.level) {
                    return `${req.masteryId} doit avoir au minimum ${req.level} points`;
                }
            }
        }
        return undefined;
    }

    pointsInBranch(branch: Mastery, selection: MasterySelection): number {
        let total = 0;
        const visit = (m: Mastery) => {
            for (const sub of m.subMasteries ?? []) {
                total += selection[sub.id] ?? 0;
                visit(sub);
            }
        };
        visit(branch);
        return total;
    }

    applyToEntity(tree: MasteryTree, selection: MasterySelection, entity: Entity): void {
        for (const mastery of this.collect(tree).values()) {
            const level = selection[mastery.id] ?? 0;
            if (level < 1) continue;

            if (mastery.statsPerLevel) {
                for (let i = 0; i < level; i++) {
                    entity.stats = Stats.add(entity.stats, mastery.statsPerLevel);
                }
            }

            const required = mastery.masteringPointsRequired ?? 0;
            if (mastery.passive && this.pointsInBranch(mastery, selection) >= required) {
                entity.effects.push({ ...mastery.passive });
            }
        }
    }
}
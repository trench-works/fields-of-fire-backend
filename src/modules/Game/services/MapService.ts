import { createNoise2D } from "simplex-noise";
import { Cell } from "../data/Game";
import { Position } from "../../../game-lib";

export class MapService {
    private getNormalizedPerlin({
        width,
        height,
    }: {
        width: number;
        height: number;
    }): number[][] {
        const acceptance = 0.5;
        const zoom = Math.min(width, height) / 10;
        const noise = createNoise2D();

        const map: number[][] = [];
        for (let x = 0; x < width; x++) {
            const line = [];
            for (let y = 0; y < height; y++) {
                const rawValue = noise(x / zoom, y / zoom);
                let value = 0;
                if (rawValue < -1 + acceptance) {
                    value = -1;
                } else if (rawValue > 1 - acceptance) {
                    value = 1;
                }
                line.push(value);
            }
            map.push(line);
        }

        return map;
    }

    private getCellAndAround(
        ungrouped: Map<string, Position>,
        cell: Position
    ): Position[] {
        const key = `${cell.x},${cell.y}`;
        if (!ungrouped.has(key)) {
            return [];
        }
        const group: Position[] = [];

        group.push(cell);
        ungrouped.delete(key);

        for (let x = cell.x - 1; x <= cell.x + 1; x++) {
            for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                if (x === cell.x || y === cell.y) {
                    group.push(...this.getCellAndAround(ungrouped, { x, y }));
                }
            }
        }

        return group;
    }

    private getGroups(noise: number[][]): Position[][] {
        const ungrouped: Map<string, Position> = new Map();
        for (let x = 0; x < noise.length; x++) {
            for (let y = 0; y < noise[x].length; y++) {
                if (noise[x][y] === 0) {
                    ungrouped.set(`${x},${y}`, { x, y });
                }
            }
        }
        const groups: Position[][] = [];
        while (ungrouped.size) {
            const firstCell = Array.from(ungrouped.values())[0];
            groups.push(this.getCellAndAround(ungrouped, firstCell));
        }
        return groups.sort((a, b) => (a.length > b.length ? -1 : 1));
    }

    private cleanGroups(noise: number[][], groups: Position[][]): number[][] {
        for (let i = 1; i < groups.length; i++) {
            for (const { x, y } of groups[i]) {
                noise[x][y] = -1;
            }
        }
        return noise;
    }

    private cleanupNoise(noise: number[][]): number[][] {
        let groups = this.getGroups(noise);
        while (groups.length > 1) {
            noise = this.cleanGroups(noise, groups);
            groups = this.getGroups(noise);
        }
        return noise;
    }

    private getNoiseGroundCount(noise: number[][]): number {
        const count = noise.flat().filter((element) => element === 0).length;
        return count;
    }

    private validateNoise(noise: number[][]): number[][] | null {
        const startCount = this.getNoiseGroundCount(noise);
        if (startCount / (noise.length * noise[0].length) < 0.6) {
            return null;
        }
        const cleanNoise = this.cleanupNoise(noise);
        const count = this.getNoiseGroundCount(cleanNoise);
        if (count / (noise.length * noise[0].length) < 0.6) {
            return null;
        }
        return cleanNoise;
    }

    generateRandomMap({
        width,
        height,
    }: {
        width: number;
        height: number;
    }): Cell[][] {
        const map: Cell[][] = [];

        let noise: null | number[][] = null;

        while (!noise) {
            const newNoise = this.getNormalizedPerlin({ width, height });
            const cleanNoise = this.validateNoise(newNoise);
            if (cleanNoise) {
                noise = cleanNoise;
            }
        }

        for (let x = 0; x < width; x++) {
            const line: Cell[] = [];
            for (let y = 0; y < height; y++) {
                const value = noise[x][y];
                line.push({
                    position: {
                        x,
                        y,
                    },
                    isWall: value === 1,
                    isHole: value === -1,
                    isStart: value === 0,
                });
            }
            map.push(line);
        }

        return map;
    }
}

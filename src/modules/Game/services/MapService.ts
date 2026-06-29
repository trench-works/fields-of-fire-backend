import { createNoise2D } from "simplex-noise";
import { Cell } from "../data/Game";

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
    generateRandomMap({
        width,
        height,
    }: {
        width: number;
        height: number;
    }): Cell[][] {
        const map: Cell[][] = [];

        const noise = this.getNormalizedPerlin({ width, height });

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

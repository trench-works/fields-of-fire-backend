import * as fs from "fs";
import { Cell } from "./Game";
import { Ran } from "../../../core";

type PremadeBoard = {
    board: {
        isStart?: boolean;
        isWall?: boolean;
        isHole?: boolean;
    }[][];
};

export class Board {
    static getRandomPremade(): Cell[][] {
        const premades: PremadeBoard[] = JSON.parse(
            fs
                .readFileSync(__dirname + "/../../../assets/premade-maps.json")
                .toString()
        );
        const premadeBoard = premades[Ran.int(premades.length)];
        return premadeBoard.board.map((line, x) =>
            line.map(
                (cell, y): Cell => ({
                    isWall: cell.isWall ?? false,
                    isHole: cell.isHole ?? false,
                    isStart: cell.isStart ?? false,
                    entityId: undefined,
                    position: {
                        x,
                        y,
                    },
                })
            )
        );
    }
}

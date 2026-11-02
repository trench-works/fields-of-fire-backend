import { JwtPayload } from "jsonwebtoken";

export type PeregrinToken = JwtPayload & {
    sign: {
        time: string;
    };
    user: {
        id: string;
    };
};

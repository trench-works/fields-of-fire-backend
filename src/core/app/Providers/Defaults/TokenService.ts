import dayjs from "dayjs";
import { sign, verify } from "jsonwebtoken";
import { isString } from "class-validator";
import { TokenInvalidError } from "./errors";
import { PeregrinToken } from "../../Types/Token";

export type TokenServiceConfig = {
    secret: string;
    expiringSeconds: number;
    oldnessSeconds: number;
};

export class TokenService {
    constructor(private readonly config: TokenServiceConfig) {}

    public authenticate(
        rawToken: string
    ): TokenInvalidError | { newToken?: string; token?: PeregrinToken } {
        if (!rawToken.length) {
            return new TokenInvalidError();
        }
        const token = this.decode(rawToken);
        if (token instanceof Error) {
            return new TokenInvalidError();
        }
        let newToken: string | undefined = undefined;
        if (this.isOld(token)) {
            newToken = this.encode(token);
        }
        return { newToken, token };
    }

    public isOld(token: PeregrinToken): boolean {
        return (
            dayjs(token.sign.time)
                .add(this.config.expiringSeconds, "seconds")
                .diff(dayjs(), "seconds") < this.config.oldnessSeconds
        );
    }

    public encode(token: Pick<PeregrinToken, "user">): string {
        return sign(
            { ...token, sign: { time: dayjs().toISOString() } },
            this.config.secret,
            { expiresIn: 60 }
        );
    }

    public decode(rawToken: string): PeregrinToken | Error {
        try {
            const token = verify(rawToken, this.config.secret, {
                maxAge: this.config.expiringSeconds,
            });
            if (isString(token)) {
                return new Error();
            }
            return token as PeregrinToken;
        } catch (err) {
            console.error(err);
            return new Error();
        }
    }
}

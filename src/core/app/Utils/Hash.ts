import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
    password: string | Buffer,
    salt: string | Buffer,
    keylen: number,
    options?: { N?: number; r?: number; p?: number; maxmem?: number }
) => Promise<Buffer>;

/**
 * Hash
 *
 * Password hashing utility built on Node's built-in scrypt implementation.
 * No external dependencies required.
 *
 * Stored format: scrypt$N$r$p$saltHex$hashHex
 * Storing the parameters alongside the hash lets you safely change the
 * scrypt cost parameters in the future without invalidating old hashes.
 */
export class Hash {
    /** CPU/memory cost parameter. Must be a power of 2. */
    private static readonly N = 16384;
    /** Block size parameter. */
    private static readonly R = 8;
    /** Parallelization parameter. */
    private static readonly P = 1;
    /** Length (in bytes) of the derived key. */
    private static readonly KEYLEN = 64;
    /** Length (in bytes) of the random salt. */
    private static readonly SALT_LEN = 16;
    /** Memory ceiling passed to scrypt (must cover N*R*P*128 bytes or more). */
    private static readonly MAXMEM = 64 * 1024 * 1024; // 64 MB

    /**
     * Hash a plaintext password.
     * Generates a new random salt on every call, so the same password
     * will produce a different stored string each time.
     */
    static async hash(password: string): Promise<string> {
        if (!password) {
            throw new Error("Hash.hash: password must be a non-empty string");
        }

        const salt = randomBytes(Hash.SALT_LEN);
        const derivedKey = await scryptAsync(password, salt, Hash.KEYLEN, {
            N: Hash.N,
            r: Hash.R,
            p: Hash.P,
            maxmem: Hash.MAXMEM,
        });

        return Hash.serialize(Hash.N, Hash.R, Hash.P, salt, derivedKey);
    }

    /**
     * Compare a plaintext password against a previously stored hash string.
     * Re-derives the key using the parameters/salt embedded in the stored
     * string, then compares in constant time.
     */
    static async compare(
        password: string,
        storedHash: string
    ): Promise<boolean> {
        if (!password || !storedHash) {
            return false;
        }

        let parsed: {
            N: number;
            r: number;
            p: number;
            salt: Buffer;
            hash: Buffer;
        };
        try {
            parsed = Hash.deserialize(storedHash);
        } catch {
            // Malformed/unsupported hash string -> never matches, never throws.
            return false;
        }

        const derivedKey = await scryptAsync(
            password,
            parsed.salt,
            parsed.hash.length,
            {
                N: parsed.N,
                r: parsed.r,
                p: parsed.p,
                maxmem: Hash.MAXMEM,
            }
        );

        // Guard against length mismatch before calling timingSafeEqual,
        // which throws if buffer lengths differ.
        if (derivedKey.length !== parsed.hash.length) {
            return false;
        }

        return timingSafeEqual(derivedKey, parsed.hash);
    }

    /**
     * Check whether a stored hash string was generated with the class's
     * current default parameters (N/R/P/keylen). Useful for transparently
     * re-hashing passwords on login after you bump the cost parameters.
     */
    static needsRehash(storedHash: string): boolean {
        try {
            const { N, r, p, hash } = Hash.deserialize(storedHash);
            return (
                N !== Hash.N ||
                r !== Hash.R ||
                p !== Hash.P ||
                hash.length !== Hash.KEYLEN
            );
        } catch {
            // Unparseable hash should be regenerated.
            return true;
        }
    }

    private static serialize(
        N: number,
        r: number,
        p: number,
        salt: Buffer,
        hash: Buffer
    ): string {
        return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${hash.toString("hex")}`;
    }

    private static deserialize(stored: string): {
        N: number;
        r: number;
        p: number;
        salt: Buffer;
        hash: Buffer;
    } {
        const parts = stored.split("$");
        if (parts.length !== 6 || parts[0] !== "scrypt") {
            throw new Error("Invalid hash format");
        }

        const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
        const N = Number.parseInt(nStr, 10);
        const r = Number.parseInt(rStr, 10);
        const p = Number.parseInt(pStr, 10);

        if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
            throw new Error("Invalid hash parameters");
        }

        return {
            N,
            r,
            p,
            salt: Buffer.from(saltHex, "hex"),
            hash: Buffer.from(hashHex, "hex"),
        };
    }
}

export default Hash;

/* ----------------------------------------------------------------------
 * Example usage
 * ------------------------------------------------------------------- */
//
// const stored = await Hash.hash("correct horse battery staple");
// // -> "scrypt$16384$8$1$<saltHex>$<hashHex>"
// // save `stored` in your users table
//
// const ok = await Hash.compare("correct horse battery staple", stored);
// // -> true
//
// const wrong = await Hash.compare("guess", stored);
// // -> false
//
// if (Hash.needsRehash(stored)) {
//   stored = await Hash.hash("correct horse battery staple");
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";

enum Colors {
    NONE = "\x1b[0m",
    GREEN = "\x1b[38;5;2m",
    RED = "\x1b[38;5;124m",
    BLUE = "\x1b[38;5;27m",
    YELLOW = "\x1b[38;5;226m",
}

export enum LogLevel {
    NONE = "NONE",
    ERROR = "ERROR",
    WARN = "WARN",
    LOG = "LOG",
    DEBUG = "DEBUG",
}

enum PrioritizedLogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    LOG = 3,
    DEBUG = 4,
}

export class LoggerService {
    private readonly logLevel: PrioritizedLogLevel;
    private appName: string = "Peregrin";

    constructor(logLevel?: LogLevel) {
        this.logLevel = (() => {
            switch (logLevel) {
                case LogLevel.NONE:
                default:
                    return PrioritizedLogLevel.NONE;
                case LogLevel.ERROR:
                    return PrioritizedLogLevel.ERROR;
                case LogLevel.WARN:
                    return PrioritizedLogLevel.WARN;
                case LogLevel.LOG:
                    return PrioritizedLogLevel.LOG;
                case LogLevel.DEBUG:
                    return PrioritizedLogLevel.DEBUG;
            }
        })();
    }

    public setAppName(appName: string): void {
        this.appName = appName;
    }

    private format(chunk: string, color: Colors, caller: string) {
        let stringChunk = chunk.toString();
        if (stringChunk.startsWith("[object Object]")) {
            stringChunk = JSON.stringify(chunk, null, 2);
        }
        return `${color}[${caller}] ${dayjs().format(
            "HH:mm:ss"
        )} ~ ${stringChunk}${Colors.NONE}`;
    }

    private print(
        chunks: any[],
        color: Colors,
        logLevel: PrioritizedLogLevel
    ) {
        let caller: string = this.appName;
        const callerInfos = (new Error()).stack?.split("\n")?.[3]?.trim()?.split(" ");
        if(callerInfos) {
            if(callerInfos[1] === "new") {
                caller = callerInfos[2];
            } else {
                caller = callerInfos[1].split(".")[0];
            }
            if(["Server", "App"].includes(caller)) {
                caller = this.appName;
            }
        }
        
        if (this.logLevel >= logLevel) {
            for (const chunk of chunks.map((chunk) =>
                this.format(chunk, color, caller)
            )) {
                console.log(chunk);
            }
        }
    }

    public debug(...chunks: any[]) {
        this.print(chunks, Colors.BLUE, PrioritizedLogLevel.DEBUG);
    }

    public log(...chunks: any[]) {
        this.print(chunks, Colors.GREEN, PrioritizedLogLevel.LOG);
    }

    public warn(...chunks: any[]) {
        this.print(chunks, Colors.YELLOW, PrioritizedLogLevel.WARN);
    }

    public error(...chunks: any[]) {
        this.print(chunks, Colors.RED, PrioritizedLogLevel.ERROR);
    }
}

export interface Logger {
    debug(...chunks: any[]): void;
    log(...chunks: any[]): void;
    warn(...chunks: any[]): void;
    error(...chunks: any[]): void;
}

import dayjs from "dayjs";

enum Colors {
    NONE = "\x1b[0m",
    GREEN = "\x1b[38;5;2m",
    RED = "\x1b[38;5;124m",
    BLUE = "\x1b[38;5;20m",
    ORANGE = "\x1b[38;5;202m",
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

    private format(chunk: string, color: Colors) {
        return `${color}[${this.appName}] ${dayjs().format(
            "HH:mm:ss:SSS"
        )} ~ ${chunk}${Colors.NONE}`;
    }

    private print(
        chunks: string[],
        color: Colors,
        logLevel: PrioritizedLogLevel
    ) {
        if (this.logLevel >= logLevel) {
            for (const chunk of chunks.map((chunk) =>
                this.format(chunk, color)
            )) {
                console.log(chunk);
            }
        }
    }

    public debug(...chunks: string[]) {
        this.print(chunks, Colors.BLUE, PrioritizedLogLevel.DEBUG);
    }

    public log(...chunks: string[]) {
        this.print(chunks, Colors.GREEN, PrioritizedLogLevel.LOG);
    }

    public warn(...chunks: string[]) {
        this.print(chunks, Colors.ORANGE, PrioritizedLogLevel.WARN);
    }

    public error(...chunks: string[]) {
        this.print(chunks, Colors.RED, PrioritizedLogLevel.ERROR);
    }
}

export interface Logger {
    debug(...chunks: string[]): void;
    log(...chunks: string[]): void;
    warn(...chunks: string[]): void;
    error(...chunks: string[]): void;
}

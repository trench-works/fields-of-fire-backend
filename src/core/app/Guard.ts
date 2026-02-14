export enum RessourceAccessLevel {
    DELETE = "DELETE",
    UPDATE = "UPDATE",
    CREATE = "CREATE",
    READ = "READ",
    NONE = "NONE",
}

export interface Guard {
    validate(): RessourceAccessLevel;
}

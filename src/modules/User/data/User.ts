export class User {
    id!: string;
    username!: string;
    password?: string;
    userMasteries?: UserMasteries[];
}

export class UserMasteries {
    classId!: string;
    points!: number;
}

export const DEFAULT_MASTERY_POINTS = 10;
export function getClassPoints(user: User, classId: string): number {
    return user.userMasteries?.find((m) => m.classId === classId)?.points ?? DEFAULT_MASTERY_POINTS;
}
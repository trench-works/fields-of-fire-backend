export class RessourceKeyUtil {
    static compareKeys(clientKey: any, actionKey: any): boolean {
        if (clientKey === undefined || actionKey === undefined) {
            return false;
        }
        return Object.keys(clientKey).every(
            (key: string) =>
                actionKey[`${key}`] === undefined ||
                clientKey[`${key}`] === actionKey[`${key}`]
        );
    }
}

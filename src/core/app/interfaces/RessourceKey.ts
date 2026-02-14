export class RessourceKey {
    static compareKeys<KeyType extends Record<string, any>>(
        clientKey: KeyType,
        actionKey: KeyType
    ): boolean {
        return Object.keys(clientKey).every(
            (key: string) =>
                actionKey[`${key}`] === undefined ||
                clientKey[`${key}`] === actionKey[`${key}`]
        );
    }
}

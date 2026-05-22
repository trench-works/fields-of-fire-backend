// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function compareKeys<
  RessourceKeyObject extends Record<string, unknown> = {},
>(clientKey: RessourceKeyObject, actionKey: RessourceKeyObject): boolean {
  if (clientKey === undefined || actionKey === undefined) {
    return false;
  }
  return Object.keys(clientKey).every(
    (key: string) =>
      actionKey[`${key}`] === undefined ||
      clientKey[`${key}`] === actionKey[`${key}`],
  );
}

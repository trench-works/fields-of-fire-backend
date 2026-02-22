type EnvProperty = string | number | boolean | EnvObject;

export type EnvObject = {
    [key: string]: EnvProperty;
};

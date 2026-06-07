import { EnvObject } from "../../Types/Env";

export type DefaultConfig = {
  app: {
    port: number;
  };
};

export const DefaultConfigValues = {
  app: {
    port: Number(process.env.APP_PORT),
  },
};

export class ConfigService<Config extends EnvObject = DefaultConfig> {
  constructor(
    private readonly env: Config = DefaultConfigValues as unknown as Config,
  ) {}

  getConfig() {
    return this.env;
  }
}

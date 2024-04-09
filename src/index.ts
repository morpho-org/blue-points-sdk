export * as BluePoints from "./types";
export * from "./distributors";
export * from "./stateManager";
export * from "./loaders";

export const config = {
  cacheEnabled: true,
};

export const setConfig = (newConfig: Partial<typeof config>) => {
  if (Object.isFrozen(config)) throw new Error("Config is frozen");
  Object.assign(config, {
    ...config,
    ...newConfig,
  });
};
export const getConfig = () => {
  Object.freeze(config);
  return config;
};

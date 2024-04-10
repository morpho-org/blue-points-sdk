export { Address, Hex } from "./types";
export * as BluePoints from "./types";

export * from "./distributors";
export * from "./stateManager";
export * from "./loaders";
export * from "./programs";
export * from "./modules";
export * from "./checkers";

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

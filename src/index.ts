export { Address, Hex } from "./types";
export * as BluePoints from "./types";

export * from "./distributors";
export * from "./client";
export * from "./loaders";
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

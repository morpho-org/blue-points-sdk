import { Immer } from "immer";

export const freemmer = new Immer({
  autoFreeze: false,
  useStrictShallowCopy: true,
});

export const mapValues = <T, U>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => U
): Record<string, U> => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]));
};

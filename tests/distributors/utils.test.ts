import { mapValues } from "../../src";

describe("distributor utils", () => {
  it("should mapValues map over values", () => {
    const obj = {
      a: 1,
      b: 2,
    };
    const result = mapValues(obj, (value, key) => value + 1 + key);

    expect(result).toStrictEqual({
      a: "2a",
      b: "3b",
    });

    expect(obj).toStrictEqual({
      a: 1,
      b: 2,
    });
  });
});

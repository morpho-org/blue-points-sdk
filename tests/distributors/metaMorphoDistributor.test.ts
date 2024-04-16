import { getAddress, Hex } from "viem";

import { State } from "../../src";
import { getPositionId } from "../../src/distributors/morphoDistributor";
import { EntityId } from "../../src/types";

export const state: State = {
  markets: {
    "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b": {
      id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b" satisfies Hex,
      totalSupplyShares: 1000000000000000000000000n,
      totalBorrowShares: 0n,
      totalCollateral: 10000n,
      totalSupplyPoints: 36000000000000000000000000n,
      totalBorrowPoints: 0n,
      totalCollateralPoints: 19680000n,
      lastUpdate: 1712113403n,
    },
    "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1": {
      id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1" satisfies Hex,
      totalSupplyShares: 500000000000n,
      totalBorrowShares: 900246302003n,
      totalCollateral: 4000000000000000000n,
      totalSupplyPoints: 4418888682513304103796n,
      totalBorrowPoints: 6752792770884622644300n,
      totalCollateralPoints: 6770271578745516586530722520n,
      lastUpdate: 1712049443n,
    },
  },

  positions: {
    [getPositionId(
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
    )]: {
      id: getPositionId(
        "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
      ),
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
      market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      supplyShares: 0n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 6304686594341171851252854600n,
      collateralPoints: 2464285725637273525921295808n,
      lastUpdate: 1712671931n,
    },
    [getPositionId(
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
    )]: {
      id: getPositionId(
        "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
      ),
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
      market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      supplyShares: 0n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 6304686594341171851252854600n,
      collateralPoints: 2464285725637273525921295808n,
      lastUpdate: 1712671931n,
    },
    [getPositionId(
      "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344")
    )]: {
      id: getPositionId(
        "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
        getAddress("0xebfa750279defa89b8d99bdd145a016f6292757b")
      ),
      user: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"), // This is a metamorpho user
      market: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      supplyShares: 108739465364687797n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 85922809433476617893472n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1712626379n,
    },
  },

  metaMorphos: {
    [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344")]: {
      id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      totalShares: 3788388601456103634055160n,
      totalPoints: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
    [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345")]: {
      id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345"),
      totalShares: 3788388601456103634055160n,
      totalPoints: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
  },
  metaMorphoPositions: {
    "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11": {
      id: "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11" as EntityId,
      metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      user: getAddress("0x77155b7d373f2b22b5944b7434ba285c5fcefea9"),
      shares: 12666472865775207373n,
      supplyPoints: 2185942811223110625091008n,
      lastUpdate: 1712554427n,
    },
    "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c": {
      id: "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c" as EntityId,
      metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"), // this is a user that has a position in the vault & in the market
      shares: 1499992396913558344n,
      supplyPoints: 0n,
      lastUpdate: 1706882015n,
    },
  },
};

describe("metaMorphoDistributor", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});

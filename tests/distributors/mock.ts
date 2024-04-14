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
      totalSupplyShards: 36000000000000000000000000n,
      totalBorrowShards: 0n,
      totalCollateralShards: 19680000n,
      lastUpdate: 1712113403n,
    },
    "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1": {
      id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1" satisfies Hex,
      totalSupplyShares: 500000000000n,
      totalBorrowShares: 900246302003n,
      totalCollateral: 4000000000000000000n,
      totalSupplyShards: 4418888682513304103796n,
      totalBorrowShards: 6752792770884622644300n,
      totalCollateralShards: 6770271578745516586530722520n,
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
      supplyShards: 0n,
      borrowShards: 6304686594341171851252854600n,
      collateralShards: 2464285725637273525921295808n,
      lastUpdate: 1712671931n,
    },
    [getPositionId(
      "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      getAddress("0xebfa750279defa89b8d99bdd145a016f6292757b")
    )]: {
      id: getPositionId(
        "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
        getAddress("0xebfa750279defa89b8d99bdd145a016f6292757b")
      ),
      user: getAddress("0xebfa750279defa89b8d99bdd145a016f6292757b"),
      market: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      supplyShares: 108739465364687797n,
      borrowShares: 0n,
      collateral: 0n,
      supplyShards: 85922809433476617893472n,
      borrowShards: 0n,
      collateralShards: 0n,
      lastUpdate: 1712626379n,
    },
  },
  metaMorphos: {},
  metaMorphoPositions: {},
};

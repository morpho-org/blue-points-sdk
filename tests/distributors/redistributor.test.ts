import * as sinon from "sinon";
import { Address, getAddress, Hex } from "viem";

import {
  MORPHO_ADDRESS,
  redistributeAll,
  redistributeMetaMorpho,
  redistributeOneMetaMorpho,
  RedistributorModule,
  State,
} from "../../src";
import { getMetaMorphoPositionId } from "../../src/distributors/metaMorphoDistributor";
import { getPositionId } from "../../src/distributors/morphoDistributor";

const metaMorpho1 = getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344");

const metaMorpho2 = getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345");
// user1 has a position in market2 and in metaMorpho1
const user1 = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
// user2 has a position in metaMorpho1 only
const user2 = getAddress("0x77155b7d373f2b22b5944b7434ba285c5fcefea9");
// user3 has a position in market 1 only
const user3 = getAddress("0x77155b7d373f2b22b5944b7434ba285c5fcefea8");
const market1 = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
const market2 = "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1";
export const state: State = {
  markets: {
    [market1]: {
      id: market1 satisfies Hex,
      totalSupplyShares: 1000n,
      totalBorrowShares: 0n,
      totalCollateral: 10000n,
      totalSupplyPoints: 1000000n,
      totalBorrowPoints: 0n,
      totalCollateralPoints: 10n,
      lastUpdate: 1000000n,
    },
    [market2]: {
      id: market2 satisfies Hex,
      totalSupplyShares: 1000n,
      totalBorrowShares: 0n,
      totalCollateral: 0n,
      totalSupplyPoints: 1000000n,
      totalBorrowPoints: 1000n,
      totalCollateralPoints: 10n,
      lastUpdate: 1000n,
    },
  },

  positions: {
    [getPositionId(market2, user1)]: {
      id: getPositionId(market2, user1),
      user: user1,
      market: market2,
      supplyShares: 0n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 10n,
      borrowPoints: 1000n,
      collateralPoints: 10n,
      lastUpdate: 1000n,
    },
    [getPositionId(market1, metaMorpho2)]: {
      id: getPositionId(market1, metaMorpho2),
      user: metaMorpho2,
      market: market1,
      supplyShares: 1000n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 1000n,
      borrowPoints: 0n,
      collateralPoints: 10n,
      lastUpdate: 1000n,
    },
    [getPositionId(market2, metaMorpho1)]: {
      id: getPositionId(market2, metaMorpho1),
      user: metaMorpho1, // This is a metamorpho user
      market: market2,
      supplyShares: 1000n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 100000n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1000n,
    },
  },

  metaMorphos: {
    [metaMorpho1]: {
      id: metaMorpho1,
      totalShares: 100n,
      totalPoints: 10n,
      lastUpdate: 1000n,
    },
    [metaMorpho2]: {
      id: metaMorpho2,
      totalShares: 100n,
      totalPoints: 0n,
      lastUpdate: 1000n,
    },
  },
  metaMorphoPositions: {
    [getMetaMorphoPositionId(metaMorpho1, user2)]: {
      id: getMetaMorphoPositionId(metaMorpho1, user2),
      metaMorpho: metaMorpho1,
      user: user2,
      shares: 10n,
      supplyPoints: 0n,
      lastUpdate: 1000n,
    },
    [getMetaMorphoPositionId(metaMorpho1, user1)]: {
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1, // this is a user that has a position in the vault & in the market
      shares: 90n,
      supplyPoints: 10n,
      lastUpdate: 1000n,
    },
    [getMetaMorphoPositionId(metaMorpho2, user1)]: {
      id: getMetaMorphoPositionId(metaMorpho2, user1),
      metaMorpho: metaMorpho2,
      user: user1, // this is a user that has a position in the vault & in the market
      shares: 90n,
      supplyPoints: 10n,
      lastUpdate: 1000n,
    },
  },
};
describe("redistributor", () => {
  describe("redistributeOneMetaMorpho", () => {
    const redistributed = redistributeOneMetaMorpho(state, metaMorpho1);

    it("should the market points balance of the vault being reduced", () => {
      const mmMarketPosition = redistributed.positions[getPositionId(market2, metaMorpho1)]!;

      expect(mmMarketPosition.supplyPoints).toBe(0n);
    });

    it("should the user1 position points balance of the vault being reduced", () => {
      const mmUser1Position = redistributed.positions[getPositionId(market2, user1)]!;

      // user1 has 100% of the vault points
      expect(mmUser1Position.supplyPoints).toBe(10n + 100000n);
    });

    it("should have redistributed only for one metaMorpho", () => {
      expect(redistributed.positions[getPositionId(market1, metaMorpho2)]).toStrictEqual(
        state.positions[getPositionId(market1, metaMorpho2)]
      );
    });
  });

  describe("redistributeAllMetaMorphos", () => {
    let stub: sinon.SinonStub;

    beforeAll(async () => {
      const module = await import("../../src/distributors/redistributor");
      stub = sinon.stub(module, "redistributeOneMetaMorpho");
      stub.callsFake((state: State, mmAddress: Address) => {
        return {
          ...state,
          callCount: stub.callCount,
        };
      });

      redistributeMetaMorpho(state);
    });

    it("should have called redistributeOneMetaMorpho for each metaMorpho", () => {
      expect(stub.callCount).toBe(2);
      expect(stub.firstCall.args[1]).toBe(metaMorpho1);
      expect(stub.firstCall.args[0]).toStrictEqual(state);
      expect(stub.secondCall.args[1]).toBe(metaMorpho2);
      expect(stub.secondCall.args[0].callCount).toBe(1);
    });
  });
  describe("redistributeAll", () => {
    let redistributorStub: sinon.SinonStub;
    let blacklistingStub: sinon.SinonStub;

    beforeAll(async () => {
      const module = await import("../../src/distributors/redistributor");
      redistributorStub = sinon.stub(module, "redistributeMetaMorpho");
      const blackListingModule = await import("../../src/modules/blacklisting");

      blacklistingStub = sinon.stub(blackListingModule, "blacklistingAddress");

      redistributorStub.callsFake((state: State) => state);
      blacklistingStub.callsFake((state: State) => state);

      redistributeAll(state);
    });

    it("should have called redistributeOneMetaMorpho for each metaMorpho", () => {
      expect(redistributorStub.callCount).toBe(1);
      expect(redistributorStub.firstCall.args[0]).toStrictEqual(state);

      expect(blacklistingStub.callCount).toBe(1);
      expect(blacklistingStub.firstCall.args[0]).toStrictEqual(state);
      expect(blacklistingStub.firstCall.args[1]).toBe(MORPHO_ADDRESS);
    });
  });
  describe("RedistributorModule", () => {
    let redistributorStub: sinon.SinonStub;

    beforeAll(async () => {
      const module = await import("../../src/distributors/redistributor");
      redistributorStub = sinon.stub(module, "redistributeAll");

      redistributorStub.callsFake((state: State) => state);

      const redistributorModule = new RedistributorModule();
      redistributorModule.handle(state);
    });

    it("should have called redistributeAll once", () => {
      expect(redistributorStub.callCount).toBe(1);
      expect(redistributorStub.firstCall.args[0]).toStrictEqual(state);
    });
  });
});

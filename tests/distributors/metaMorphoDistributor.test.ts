import { getAddress, Hex } from "viem";

import { State } from "../../src";
import {
  computeMetaMorphoPositionPoints,
  computeMetaMorphoVaultPoints,
  getMetaMorphoPositionId,
  handleMetaMorphoTx,
  initMetaMorpho,
  initMetaMorphoPosition,
} from "../../src/distributors/metaMorphoDistributor";
import { getPositionId } from "../../src/distributors/morphoDistributor";
import { MetaMorpho, MetaMorphoPosition, MetaMorphoTx } from "../../src/types";

// metaMorpho1 has a position in market 2
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
      totalSupplyShares: 1000000000000000000000000n,
      totalBorrowShares: 0n,
      totalCollateral: 10000n,
      totalSupplyPoints: 36000000000000000000000000n,
      totalBorrowPoints: 0n,
      totalCollateralPoints: 19680000n,
      lastUpdate: 1712113403n,
    },
    [market2]: {
      id: market2 satisfies Hex,
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
    [getPositionId(market2, user1)]: {
      id: getPositionId(market2, user1),
      user: user1,
      market: market2,
      supplyShares: 0n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 6304686594341171851252854600n,
      collateralPoints: 2464285725637273525921295808n,
      lastUpdate: 1712671931n,
    },
    [getPositionId(market1, user3)]: {
      id: getPositionId(market1, user3),
      user: user3,
      market: market1,
      supplyShares: 0n,
      borrowShares: 100000n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 6304686594341171851252854600n,
      collateralPoints: 2464285725637273525921295808n,
      lastUpdate: 1712671931n,
    },
    [getPositionId(market2, metaMorpho1)]: {
      id: getPositionId(market2, metaMorpho1),
      user: metaMorpho1, // This is a metamorpho user
      market: market2,
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
    [metaMorpho1]: {
      id: metaMorpho1,
      totalShares: 3788388601456103634055160n,
      totalPoints: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
    [metaMorpho2]: {
      id: metaMorpho2,
      totalShares: 3788388601456103634055160n,
      totalPoints: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
  },
  metaMorphoPositions: {
    [getMetaMorphoPositionId(metaMorpho1, user2)]: {
      id: getMetaMorphoPositionId(metaMorpho1, user2),
      metaMorpho: metaMorpho1,
      user: user2,
      shares: 12666472865775207373n,
      supplyPoints: 2185942811223110625091008n,
      lastUpdate: 1712554427n,
    },
    [getMetaMorphoPositionId(metaMorpho1, user1)]: {
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1, // this is a user that has a position in the vault & in the market
      shares: 1499992396913558344n,
      supplyPoints: 0n,
      lastUpdate: 1706882015n,
    },
  },
};

describe("metaMorphoDistributor", () => {
  it("should getMetaMorphoPositionId return a concatenation of the vault address & the user address", () => {
    expect(getMetaMorphoPositionId(metaMorpho1, user1)).toBe(
      "0x186514400e52270cef3d80e1c6f8d10a75d47344" + "51382c7e0ff4dd26683b3356f4fd1320f9cf3327"
    );
  });
  it("should getMetaMorphoPositionId return a lowercase hex string", () => {
    expect(getMetaMorphoPositionId(metaMorpho1, user1)).toBe(
      getMetaMorphoPositionId(metaMorpho1, user1).toLowerCase()
    );
  });
  it("should initMetaMorpho return a MetaMorpho object", () => {
    expect(initMetaMorpho(metaMorpho1)).toStrictEqual({
      id: metaMorpho1,
      totalShares: 0n,
      totalPoints: 0n,
      lastUpdate: 0n,
    });
  });

  it("should initMetaMorphoPosition return a MetaMorphoPosition object", () => {
    expect(initMetaMorphoPosition(metaMorpho1, user1)).toStrictEqual({
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1,
      shares: 0n,
      supplyPoints: 0n,
      lastUpdate: 0n,
    });
  });

  it("should computeMetaMorphoPositionPoints add points to a position", () => {
    const position: MetaMorphoPosition = {
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1,
      shares: 20n,
      supplyPoints: 10n,
      lastUpdate: 0n,
    };
    const newPosition = computeMetaMorphoPositionPoints(position, 100n);
    expect(newPosition).toStrictEqual({
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1,
      shares: 20n,
      supplyPoints: position.supplyPoints + position.shares * (100n - position.lastUpdate),
      lastUpdate: 100n,
    });

    expect(position).toStrictEqual({
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1,
      shares: 20n,
      supplyPoints: 10n,
      lastUpdate: 0n,
    });
  });

  it("should computeMetaMorphoPositionPoints throw if there is a future lastUpdate", () => {
    const position: MetaMorphoPosition = {
      id: getMetaMorphoPositionId(metaMorpho1, user1),
      metaMorpho: metaMorpho1,
      user: user1,
      shares: 20n,
      supplyPoints: 10n,
      lastUpdate: 100n,
    };
    expect(() => computeMetaMorphoPositionPoints(position, 50n)).toThrowError(
      `MetaMorphoPosition ${position.id} has a future lastUpdate`
    );
  });

  it("should computeMetaMorphoVaultPoints add points to a vault", () => {
    const vault: MetaMorpho = {
      id: metaMorpho1,
      totalShares: 20n,
      totalPoints: 10n,
      lastUpdate: 0n,
    };
    const newVault = computeMetaMorphoVaultPoints(vault, 100n);
    expect(newVault).toStrictEqual({
      id: metaMorpho1,
      totalShares: vault.totalShares,
      totalPoints: vault.totalPoints + vault.totalShares * (100n - vault.lastUpdate),
      lastUpdate: 100n,
    });
    expect(vault).toStrictEqual({
      id: metaMorpho1,
      totalShares: 20n,
      totalPoints: 10n,
      lastUpdate: 0n,
    });
  });
  it("should computeMetaMorphoVaultPoints throw if there is a future lastUpdate", () => {
    const vault: MetaMorpho = {
      id: metaMorpho1,
      totalShares: 20n,
      totalPoints: 10n,
      lastUpdate: 100n,
    };
    expect(() => computeMetaMorphoVaultPoints(vault, 50n)).toThrowError(
      `MetaMorpho ${vault.id} has a future lastUpdate`
    );
  });

  it("should handleMetaMorphoTx handle a deposit", () => {
    const mmTx: MetaMorphoTx = {
      id: "0x1",
      metaMorpho: metaMorpho1,
      user: user1,
      timestamp: 1712836667n + 10n,
      shares: 10n,

      txIndex: 1n,
      txHash: "0x1",
      logIndex: 1n,
      blockNumber: 1n,
    };
    const initialMetaMorpho = state.metaMorphos[metaMorpho1]!;
    const initialPosition = state.metaMorphoPositions[getMetaMorphoPositionId(metaMorpho1, user1)]!;

    const newState = handleMetaMorphoTx(state, mmTx);

    const finalMetaMorpho = newState.metaMorphos[metaMorpho1]!;
    const finalPosition =
      newState.metaMorphoPositions[getMetaMorphoPositionId(metaMorpho1, user1)]!;

    expect(finalMetaMorpho).toStrictEqual({
      ...initialMetaMorpho,
      totalShares: initialMetaMorpho.totalShares + mmTx.shares,
      totalPoints:
        initialMetaMorpho.totalPoints +
        initialMetaMorpho.totalShares * (mmTx.timestamp - initialMetaMorpho.lastUpdate),
      lastUpdate: mmTx.timestamp,
    });

    expect(finalPosition).toStrictEqual({
      ...initialPosition,
      shares: initialPosition.shares + mmTx.shares,
      supplyPoints:
        initialPosition.supplyPoints +
        initialPosition.shares * (mmTx.timestamp - initialPosition.lastUpdate),
      lastUpdate: mmTx.timestamp,
    });
  });
});

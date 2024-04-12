import { Address, getAddress, Hex } from "viem";

import { State } from "../../src";
import {
  computeMarketShards,
  computePositionShards,
  getPositionId,
  handleMorphoTx,
  initPosition,
  initPositionShards,
} from "../../src/distributors/morphoDistributor";
import { EntityId, Market, MorphoTx, Position, PositionType } from "../../src/types";

const state: State = {
  markets: {
    "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b": {
      id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b" satisfies Hex,
      loanToken: getAddress("0x6b175474e89094c44da98b954eedeac495271d0f"),
      collateralToken: getAddress("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"),
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
      loanToken: getAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      collateralToken: getAddress("0x83f20f44975d03b1b09e64809b757c47f942beea"),
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

  metaMorphos: {
    [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344")]: {
      id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      totalShares: 3788388601456103634055160n,
      totalShards: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
    [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345")]: {
      id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345"),
      totalShares: 3788388601456103634055160n,
      totalShards: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
  },
  metaMorphoPositions: {
    "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11": {
      id: "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11" as EntityId,
      metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      user: getAddress("0x77155b7d373f2b22b5944b7434ba285c5fcefea9"),
      shares: 12666472865775207373n,
      supplyShards: 2185942811223110625091008n,
      lastUpdate: 1712554427n,
    },
    "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c": {
      id: "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c" as EntityId,
      metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      user: getAddress("0x408e986a277da059a90c4be5051f67c6e3fd5cff"),
      shares: 1499992396913558344n,
      supplyShards: 0n,
      lastUpdate: 1706882015n,
    },
  },
};

describe("Morpho distributor", () => {
  it("should getPositionId return a concatenation of the market id & the user address", () => {
    const marketId: Hex = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
    const user: Address = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
    const positionId = getPositionId(marketId, user);
    expect(positionId).toEqual(
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b51382c7e0ff4dd26683b3356f4fd1320f9cf3327"
    );
  });
  it("should initPositionShards create the correct entity", () => {
    const marketId: Hex = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
    const user: Address = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
    const position = initPositionShards(marketId, user);

    expect(position).toMatchSnapshot();
  });

  it("should initPosition create the correct entity", () => {
    const marketId: Hex = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
    const user: Address = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
    const position = initPosition(marketId, user);

    expect(position).toMatchSnapshot();
  });

  it("should computeMarketShards update the suupply shards correctly", () => {
    const market = state.markets[
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b"
    ] as Market;
    const timestamp = 1712113403n + 10n;

    const editedMarket = computeMarketShards(market, timestamp);

    expect(editedMarket.totalSupplyShards).toEqual(
      36000000000000000000000000n + 10n * market.totalSupplyShares
    );
    expect(editedMarket.totalBorrowShards).toEqual(0n);
    expect(editedMarket.totalCollateralShards).toEqual(19680000n + 10n * market.totalCollateral);
    expect(editedMarket.lastUpdate).toEqual(timestamp);

    // check if the original market is not mutated
    expect(market.totalSupplyShards).toEqual(36000000000000000000000000n);
    expect(market.totalBorrowShards).toEqual(0n);
    expect(market.totalCollateralShards).toEqual(19680000n);
    expect(market.lastUpdate).toEqual(1712113403n);
  });

  it("should computeMarketShards throws if there is a future lastUpdate", () => {
    const market = state.markets[
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b"
    ] as Market;
    const timestamp = 1712113403n - 10n;

    expect(() => computeMarketShards(market, timestamp)).toThrowError(
      `Market ${market.id} has a future lastUpdate`
    );
  });

  it("should computePositionShards update the shards correctly", () => {
    const position = state.positions[
      getPositionId(
        "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
      )
    ] as Position;
    const timestamp = 1712671931n + 10n;

    const editedPosition = computePositionShards(position, timestamp);

    expect(editedPosition.supplyShards).toEqual(0n + 10n * position.supplyShares);
    expect(editedPosition.borrowShards).toEqual(
      6304686594341171851252854600n + 10n * position.borrowShares
    );
    expect(editedPosition.collateralShards).toEqual(
      2464285725637273525921295808n + 10n * position.collateral
    );
    expect(editedPosition.lastUpdate).toEqual(timestamp);

    // check if the original position is not mutated
    expect(position.supplyShards).toEqual(0n);
    expect(position.borrowShards).toEqual(6304686594341171851252854600n);
    expect(position.collateralShards).toEqual(2464285725637273525921295808n);
    expect(position.lastUpdate).toEqual(1712671931n);
  });

  it("should computePositionShards throws if there is a future lastUpdate", () => {
    const position = state.positions[
      getPositionId(
        "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
      )
    ] as Position;

    const timestamp = 1712671931n - 10n;

    expect(() => computePositionShards(position, timestamp)).toThrowError(
      `Position ${position.id} has a future lastUpdate`
    );
  });

  it("should handleMorphoTx update the state correctly for a supply transaction", () => {
    const initialState = { ...state };

    const tx: MorphoTx = {
      market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
      shares: 100n,
      timestamp: 1712671931n + 10n,
      type: PositionType.SUPPLY,
      id: "0x1",
      blockNumber: 1n,
      logIndex: 1n,
      txHash: "0x1",
      txIndex: 1n,
    };

    const newState = handleMorphoTx(initialState, tx);

    const initialMarket = initialState.markets[tx.market] as Market;
    const initialPosition = initialState.positions[getPositionId(tx.market, tx.user)] as Position;

    const finalMarket = newState.markets[tx.market] as Market;
    const finalPosition = newState.positions[getPositionId(tx.market, tx.user)] as Position;

    const deltaTMarket = tx.timestamp - initialMarket.lastUpdate;

    expect(finalMarket.totalSupplyShards).toEqual(
      initialMarket.totalSupplyShards + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowShards).toEqual(
      initialMarket.totalBorrowShards + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralShards).toEqual(
      initialMarket.totalCollateralShards + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyShards).toEqual(
      initialPosition.supplyShards + 10n * initialPosition.supplyShares
    );
    expect(finalPosition.borrowShards).toEqual(
      initialPosition.borrowShards + 10n * initialPosition.borrowShares
    );
    expect(finalPosition.collateralShards).toEqual(
      initialPosition.collateralShards + 10n * initialPosition.collateral
    );

    // accounting
    expect(finalPosition.supplyShares).toEqual(initialPosition.supplyShares + tx.shares);
    expect(finalPosition.borrowShares).toEqual(initialPosition.borrowShares);
    expect(finalPosition.collateral).toEqual(initialPosition.collateral);

    expect(finalMarket.totalSupplyShares).toEqual(initialMarket.totalSupplyShares + tx.shares);
    expect(finalMarket.totalBorrowShares).toEqual(initialMarket.totalBorrowShares);
    expect(finalMarket.totalCollateral).toEqual(initialMarket.totalCollateral);
  });

  it("should handleMorphoTx update the state correctly for a borrow transaction", () => {
    const initialState = { ...state };

    const tx: MorphoTx = {
      market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
      shares: 100n,
      timestamp: 1712671931n + 10n,
      type: PositionType.BORROW,
      id: "0x1",
      blockNumber: 1n,
      logIndex: 1n,
      txHash: "0x1",
      txIndex: 1n,
    };

    const newState = handleMorphoTx(initialState, tx);

    const initialMarket = initialState.markets[tx.market] as Market;
    const initialPosition = initialState.positions[getPositionId(tx.market, tx.user)] as Position;

    const finalMarket = newState.markets[tx.market] as Market;
    const finalPosition = newState.positions[getPositionId(tx.market, tx.user)] as Position;

    const deltaTMarket = tx.timestamp - initialMarket.lastUpdate;

    expect(finalMarket.totalSupplyShards).toEqual(
      initialMarket.totalSupplyShards + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowShards).toEqual(
      initialMarket.totalBorrowShards + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralShards).toEqual(
      initialMarket.totalCollateralShards + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyShards).toEqual(
      initialPosition.supplyShards + 10n * initialPosition.supplyShares
    );
    expect(finalPosition.borrowShards).toEqual(
      initialPosition.borrowShards + 10n * initialPosition.borrowShares
    );
    expect(finalPosition.collateralShards).toEqual(
      initialPosition.collateralShards + 10n * initialPosition.collateral
    );

    // accounting
    expect(finalPosition.supplyShares).toEqual(initialPosition.supplyShares);
    expect(finalPosition.borrowShares).toEqual(initialPosition.borrowShares + tx.shares);
    expect(finalPosition.collateral).toEqual(initialPosition.collateral);

    expect(finalMarket.totalSupplyShares).toEqual(initialMarket.totalSupplyShares);
    expect(finalMarket.totalBorrowShares).toEqual(initialMarket.totalBorrowShares + tx.shares);
    expect(finalMarket.totalCollateral).toEqual(initialMarket.totalCollateral);
  });

  it("should handleMorphoTx update the state correctly for a collateral transaction", () => {
    const initialState = { ...state };

    const tx: MorphoTx = {
      market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
      shares: 100n,
      timestamp: 1712671931n + 10n,
      type: PositionType.COLLATERAL,
      id: "0x1",
      blockNumber: 1n,
      logIndex: 1n,
      txHash: "0x1",
      txIndex: 1n,
    };

    const newState = handleMorphoTx(initialState, tx);

    const initialMarket = initialState.markets[tx.market] as Market;
    const initialPosition = initialState.positions[getPositionId(tx.market, tx.user)] as Position;

    const finalMarket = newState.markets[tx.market] as Market;
    const finalPosition = newState.positions[getPositionId(tx.market, tx.user)] as Position;

    const deltaTMarket = tx.timestamp - initialMarket.lastUpdate;

    expect(finalMarket.totalSupplyShards).toEqual(
      initialMarket.totalSupplyShards + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowShards).toEqual(
      initialMarket.totalBorrowShards + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralShards).toEqual(
      initialMarket.totalCollateralShards + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyShards).toEqual(
      initialPosition.supplyShards + 10n * initialPosition.supplyShares
    );
    expect(finalPosition.borrowShards).toEqual(
      initialPosition.borrowShards + 10n * initialPosition.borrowShares
    );
    expect(finalPosition.collateralShards).toEqual(
      initialPosition.collateralShards + 10n * initialPosition.collateral
    );

    // accounting
    expect(finalPosition.supplyShares).toEqual(initialPosition.supplyShares);
    expect(finalPosition.borrowShares).toEqual(initialPosition.borrowShares);
    expect(finalPosition.collateral).toEqual(initialPosition.collateral + tx.shares);

    expect(finalMarket.totalSupplyShares).toEqual(initialMarket.totalSupplyShares);
    expect(finalMarket.totalBorrowShares).toEqual(initialMarket.totalBorrowShares);
    expect(finalMarket.totalCollateral).toEqual(initialMarket.totalCollateral + tx.shares);
  });

  it("should handleMorphoTx throw if the market is not found", () => {
    const tx: MorphoTx = {
      market: "0xAAA",
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
      shares: 100n,
      timestamp: 1712671931n + 10n,
      type: PositionType.COLLATERAL,
      id: "0x1",
      blockNumber: 1n,
      logIndex: 1n,
      txHash: "0x1",
      txIndex: 1n,
    };
    expect(() => handleMorphoTx(state, tx)).toThrowError(`Market ${tx.market} not found`);
  });
});

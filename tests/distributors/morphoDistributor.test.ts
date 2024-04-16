import { Address, getAddress, Hex } from "viem";

import {
  computeMarketPoints,
  computePositionPoints,
  getPositionId,
  handleMorphoTx,
  initPosition,
  initPositionPoints,
} from "../../src/distributors/morphoDistributor";
import { Market, MorphoTx, Position, PositionType } from "../../src/types";

import { state } from "./mock";

describe("Morpho distributor", () => {
  it("should getPositionId return a concatenation of the market id & the user address", () => {
    const marketId: Hex = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
    const user: Address = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
    const positionId = getPositionId(marketId, user);
    expect(positionId).toEqual(
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b51382c7e0ff4dd26683b3356f4fd1320f9cf3327"
    );
  });
  it("should initPositionPoints create the correct entity", () => {
    const marketId: Hex = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
    const user: Address = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
    const position = initPositionPoints(marketId, user);

    expect(position).toMatchSnapshot();
  });

  it("should initPosition create the correct entity", () => {
    const marketId: Hex = "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b";
    const user: Address = getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327");
    const position = initPosition(marketId, user);

    expect(position).toMatchSnapshot();
  });

  it("should computeMarketPoints update the suupply points correctly", () => {
    const market = state.markets[
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b"
    ] as Market;
    const timestamp = 1712113403n + 10n;

    const editedMarket = computeMarketPoints(market, timestamp);

    expect(editedMarket.totalSupplyPoints).toEqual(
      36000000000000000000000000n + 10n * market.totalSupplyShares
    );
    expect(editedMarket.totalBorrowPoints).toEqual(0n);
    expect(editedMarket.totalCollateralPoints).toEqual(19680000n + 10n * market.totalCollateral);
    expect(editedMarket.lastUpdate).toEqual(timestamp);

    // check if the original market is not mutated
    expect(market.totalSupplyPoints).toEqual(36000000000000000000000000n);
    expect(market.totalBorrowPoints).toEqual(0n);
    expect(market.totalCollateralPoints).toEqual(19680000n);
    expect(market.lastUpdate).toEqual(1712113403n);
  });

  it("should computeMarketPoints throws if there is a future lastUpdate", () => {
    const market = state.markets[
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b"
    ] as Market;
    const timestamp = 1712113403n - 10n;

    expect(() => computeMarketPoints(market, timestamp)).toThrowError(
      `Market ${market.id} has a future lastUpdate`
    );
  });

  it("should computePositionPoints update the points correctly", () => {
    const position = state.positions[
      getPositionId(
        "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
      )
    ] as Position;
    const timestamp = 1712671931n + 10n;

    const editedPosition = computePositionPoints(position, timestamp);

    expect(editedPosition.supplyPoints).toEqual(0n + 10n * position.supplyShares);
    expect(editedPosition.borrowPoints).toEqual(
      6304686594341171851252854600n + 10n * position.borrowShares
    );
    expect(editedPosition.collateralPoints).toEqual(
      2464285725637273525921295808n + 10n * position.collateral
    );
    expect(editedPosition.lastUpdate).toEqual(timestamp);

    // check if the original position is not mutated
    expect(position.supplyPoints).toEqual(0n);
    expect(position.borrowPoints).toEqual(6304686594341171851252854600n);
    expect(position.collateralPoints).toEqual(2464285725637273525921295808n);
    expect(position.lastUpdate).toEqual(1712671931n);
  });

  it("should computePositionPoints throws if there is a future lastUpdate", () => {
    const position = state.positions[
      getPositionId(
        "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327")
      )
    ] as Position;

    const timestamp = 1712671931n - 10n;

    expect(() => computePositionPoints(position, timestamp)).toThrowError(
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

    expect(finalMarket.totalSupplyPoints).toEqual(
      initialMarket.totalSupplyPoints + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowPoints).toEqual(
      initialMarket.totalBorrowPoints + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralPoints).toEqual(
      initialMarket.totalCollateralPoints + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyPoints).toEqual(
      initialPosition.supplyPoints + 10n * initialPosition.supplyShares
    );
    expect(finalPosition.borrowPoints).toEqual(
      initialPosition.borrowPoints + 10n * initialPosition.borrowShares
    );
    expect(finalPosition.collateralPoints).toEqual(
      initialPosition.collateralPoints + 10n * initialPosition.collateral
    );

    // accounting
    expect(finalPosition.supplyShares).toEqual(initialPosition.supplyShares + tx.shares);
    expect(finalPosition.borrowShares).toEqual(initialPosition.borrowShares);
    expect(finalPosition.collateral).toEqual(initialPosition.collateral);

    expect(finalMarket.totalSupplyShares).toEqual(initialMarket.totalSupplyShares + tx.shares);
    expect(finalMarket.totalBorrowShares).toEqual(initialMarket.totalBorrowShares);
    expect(finalMarket.totalCollateral).toEqual(initialMarket.totalCollateral);
  });

  it("should handleMorphoTx update the state correctly for a new user", () => {
    const initialState = { ...state };

    const tx: MorphoTx = {
      market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3330"),
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

    const finalMarket = newState.markets[tx.market] as Market;
    const finalPosition = newState.positions[getPositionId(tx.market, tx.user)] as Position;

    const deltaTMarket = tx.timestamp - initialMarket.lastUpdate;

    expect(finalMarket.totalSupplyPoints).toEqual(
      initialMarket.totalSupplyPoints + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowPoints).toEqual(
      initialMarket.totalBorrowPoints + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralPoints).toEqual(
      initialMarket.totalCollateralPoints + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyPoints).toEqual(0n);
    expect(finalPosition.borrowPoints).toEqual(0n);
    expect(finalPosition.collateralPoints).toEqual(0n);

    // accounting
    expect(finalPosition.supplyShares).toEqual(tx.shares);
    expect(finalPosition.borrowShares).toEqual(0n);
    expect(finalPosition.collateral).toEqual(0n);

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

    expect(finalMarket.totalSupplyPoints).toEqual(
      initialMarket.totalSupplyPoints + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowPoints).toEqual(
      initialMarket.totalBorrowPoints + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralPoints).toEqual(
      initialMarket.totalCollateralPoints + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyPoints).toEqual(
      initialPosition.supplyPoints + 10n * initialPosition.supplyShares
    );
    expect(finalPosition.borrowPoints).toEqual(
      initialPosition.borrowPoints + 10n * initialPosition.borrowShares
    );
    expect(finalPosition.collateralPoints).toEqual(
      initialPosition.collateralPoints + 10n * initialPosition.collateral
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

    expect(finalMarket.totalSupplyPoints).toEqual(
      initialMarket.totalSupplyPoints + deltaTMarket * initialMarket.totalSupplyShares
    );
    expect(finalMarket.totalBorrowPoints).toEqual(
      initialMarket.totalBorrowPoints + deltaTMarket * initialMarket.totalBorrowShares
    );
    expect(finalMarket.totalCollateralPoints).toEqual(
      initialMarket.totalCollateralPoints + deltaTMarket * initialMarket.totalCollateral
    );
    expect(finalMarket.lastUpdate).toEqual(tx.timestamp);

    expect(finalPosition.supplyPoints).toEqual(
      initialPosition.supplyPoints + 10n * initialPosition.supplyShares
    );
    expect(finalPosition.borrowPoints).toEqual(
      initialPosition.borrowPoints + 10n * initialPosition.borrowShares
    );
    expect(finalPosition.collateralPoints).toEqual(
      initialPosition.collateralPoints + 10n * initialPosition.collateral
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

import { Address, concat, Hex } from "viem";

import { State } from "../client";
import { Market, MorphoTx, Position, PositionPoints, PositionType } from "../types";

export const getPositionId = (market: Hex, user: Address) =>
  concat([market, user]).toString().toLowerCase();
export const initPosition = (market: Hex, user: Address): Position => ({
  ...initPositionPoints(market, user),
  supplyShares: 0n,
  borrowShares: 0n,
  collateral: 0n,
  lastUpdate: 0n,
});
export const initPositionPoints = (market: Hex, user: Address): PositionPoints => ({
  id: getPositionId(market, user),
  market,
  user,
  supplyPoints: 0n,
  borrowPoints: 0n,
  collateralPoints: 0n,
});

export const computeMarketPoints = (_market: Market, timestamp: bigint) => {
  const market = { ..._market };

  const deltaT = timestamp - market.lastUpdate;
  if (deltaT < 0) {
    throw new Error(`Market ${_market.id} has a future lastUpdate`);
  }

  const supplyPointsEmitted = deltaT * market.totalSupplyShares;
  market.totalSupplyPoints += supplyPointsEmitted;

  const borrowPointsEmitted = deltaT * market.totalBorrowShares;
  market.totalBorrowPoints += borrowPointsEmitted;

  const collateralPointsEmitted = deltaT * market.totalCollateral;
  market.totalCollateralPoints += collateralPointsEmitted;

  market.lastUpdate = timestamp;

  return market;
};

export const computePositionPoints = (_position: Position, timestamp: bigint) => {
  const position = { ..._position };
  const deltaT = timestamp - position.lastUpdate;
  if (deltaT < 0) {
    throw new Error(`Position ${_position.id} has a future lastUpdate`);
  }

  const supplyPointsAccrued = deltaT * position.supplyShares;
  position.supplyPoints += supplyPointsAccrued;

  const borrowPointsAccrued = deltaT * position.borrowShares;
  position.borrowPoints += borrowPointsAccrued;

  const collateralPointsAccrued = deltaT * position.collateral;
  position.collateralPoints += collateralPointsAccrued;

  position.lastUpdate = timestamp;

  return position;
};

export const handleMorphoTx = (
  state: State,
  { market, user, timestamp, shares, type }: MorphoTx
) => {
  const marketEntity = state.markets[market];
  if (!marketEntity) {
    throw new Error(`Market ${market} not found`);
  }

  const position = state.positions[getPositionId(market, user)] ?? initPosition(market, user);

  const marketWithPoints = computeMarketPoints(marketEntity, timestamp);
  const positionWithPoints = computePositionPoints(position, timestamp);

  const modifiedState = {
    ...state,
    markets: { ...state.markets },
    positions: { ...state.positions },
  };

  modifiedState.markets[market] = marketWithPoints;
  modifiedState.positions[positionWithPoints.id] = positionWithPoints;

  switch (type) {
    case PositionType.SUPPLY:
      modifiedState.markets[market]!.totalSupplyShares += shares;
      modifiedState.positions[positionWithPoints.id]!.supplyShares += shares;
      break;
    case PositionType.BORROW:
      modifiedState.markets[market]!.totalBorrowShares += shares;
      modifiedState.positions[positionWithPoints.id]!.borrowShares += shares;
      break;
    case PositionType.COLLATERAL:
      modifiedState.markets[market]!.totalCollateral += shares;
      modifiedState.positions[positionWithPoints.id]!.collateral += shares;
      break;
  }
  return modifiedState;
};

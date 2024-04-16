import { PointsState, getConfig, State } from "..";

import {
  computeMetaMorphoPositionPoints,
  computeMetaMorphoVaultPoints,
} from "./metaMorphoDistributor";
import { computeMarketPoints, computePositionPoints } from "./morphoDistributor";
import { mapValues } from "./utils";

const distributedStateCache = new Map<number, PointsState>();

const cleanPointsState = (state: State): PointsState => {
  const markets = mapValues(
    state.markets,
    ({ totalSupplyPoints, totalCollateralPoints, totalBorrowPoints, id }) => ({
      totalSupplyPoints,
      totalCollateralPoints,
      totalBorrowPoints,
      id,
    })
  );

  const positions = mapValues(
    state.positions,
    ({ id, supplyPoints, borrowPoints, collateralPoints, market, user }) => ({
      id,
      supplyPoints,
      borrowPoints,
      collateralPoints,
      market,
      user,
    })
  );

  const metaMorphos = mapValues(state.metaMorphos, ({ totalPoints, id }) => ({
    totalPoints,
    id,
  }));

  const metaMorphoPositions = mapValues(
    state.metaMorphoPositions,
    ({ id, supplyPoints, metaMorpho, user }) => ({
      id,
      supplyPoints,
      metaMorpho,
      user,
    })
  );

  return {
    markets,
    positions,
    metaMorphos,
    metaMorphoPositions,
  };
};

export const distributeUpTo = (state: State, timestamp: bigint): PointsState => {
  const config = getConfig();
  if (config.cacheEnabled && distributedStateCache.has(Number(timestamp))) {
    return distributedStateCache.get(Number(timestamp))!;
  }

  const markets = mapValues(state.markets, (market) => computeMarketPoints(market, timestamp));

  const positions = mapValues(state.positions, (position) =>
    computePositionPoints(position, timestamp)
  );

  const metaMorphos = mapValues(state.metaMorphos, (metaMorpho) =>
    computeMetaMorphoVaultPoints(metaMorpho, timestamp)
  );

  const metaMorphoPositions = mapValues(state.metaMorphoPositions, (position) =>
    computeMetaMorphoPositionPoints(position, timestamp)
  );
  const snapshot = cleanPointsState({
    markets,
    positions,
    metaMorphos,
    metaMorphoPositions,
  });

  if (config.cacheEnabled) {
    distributedStateCache.set(Number(timestamp), snapshot);
  }

  return snapshot;
};

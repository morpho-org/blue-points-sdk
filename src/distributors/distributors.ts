import { computeMarketPoints, computePositionPoints } from "./morphoDistributor";
import {
  computeMetaMorphoPositionPoints,
  computeMetaMorphoVaultPoints,
} from "./metaMorphoDistributor";
import { mapValues } from "./utils";
import { PointsState, getConfig, State } from "..";

const distributedStateCache = new Map<number, PointsState>();

const cleanPointsState = (state: State): PointsState => {
  const markets = mapValues(
    state.markets,
    ({
      totalSupplyShards,
      totalCollateralShards,
      totalBorrowShards,
      id,
      loanToken,
      collateralToken,
    }) => ({
      totalSupplyShards,
      totalCollateralShards,
      totalBorrowShards,
      id,
      loanToken,
      collateralToken,
    })
  );

  const positions = mapValues(
    state.positions,
    ({ id, supplyShards, borrowShards, collateralShards, market, user }) => ({
      id,
      supplyShards,
      borrowShards,
      collateralShards,
      market,
      user,
    })
  );

  const metaMorphos = mapValues(state.metaMorphos, ({ totalShards, id }) => ({
    totalShards,
    id,
  }));

  const metaMorphoPositions = mapValues(
    state.metaMorphoPositions,
    ({ id, supplyShards, metaMorpho, user }) => ({
      id,
      supplyShards,
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

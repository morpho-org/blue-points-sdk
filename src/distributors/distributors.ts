import { State } from "../stateManager";
import { computeMarketPoints, computePositionPoints } from "./morphoDistributor";
import {
  computeMetaMorphoPositionPoints,
  computeMetaMorphoVaultPoints,
} from "./metaMorphoDistributor";
import { mapValues } from "./utils";
import { PointsState } from "../stateManager/StateManager";
import { getConfig } from "../index";

const distributedStateCache = new Map<number, PointsState>();

export const distributeUpTo = (state: State, timestamp: bigint): PointsState => {
  const config = getConfig();
  if (config.cacheEnabled && distributedStateCache.has(Number(timestamp))) {
    return distributedStateCache.get(Number(timestamp))!;
  }

  const markets = mapValues(state.markets, (market) => computeMarketPoints(market, timestamp));

  const positions = mapValues(state.positions, (position) =>
    computePositionPoints(markets[position.market]!, position, timestamp)
  );

  const metaMorphos = mapValues(state.metaMorphos, (metaMorpho) =>
    computeMetaMorphoVaultPoints(metaMorpho, timestamp)
  );

  const metaMorphoPositions = mapValues(state.metaMorphoPositions, (position) =>
    computeMetaMorphoPositionPoints(metaMorphos[position.metaMorpho]!, position, timestamp)
  );
  const snapshot = {
    markets,
    positions,
    metaMorphos,
    metaMorphoPositions,
  };

  if (config.cacheEnabled) {
    distributedStateCache.set(Number(timestamp), snapshot);
  }

  return snapshot;
};

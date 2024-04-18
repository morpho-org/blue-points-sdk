import * as fs from "node:fs";
import { Address, getAddress, Hex } from "viem";

import { State } from "../client";
import { areStatesEqual, distributeUpTo, stateDiff } from "../distributors";
import { Market, MetaMorpho, MetaMorphoPosition, Position } from "../types";

import { loadFullFromSubgraph } from "./fullLoader";
import { loadFullForMarkets } from "./marketsLoader";
import { loadFullForMarketsAndMetaMorphos } from "./marketsMetaMorphosLoader";
import { loadFullForMetaMorphos } from "./metaMorphosLoader";
import { loadFullForUsers } from "./usersLoader";
import { loadFullForUsersAndMarkets } from "./usersMarketsLoader";
import { loadFullForUsersAndMarketsAndMetaMorphos } from "./usersMarketsMetaMorphosLoader";

export interface SubgraphConfig {
  url: string;
  querySize?: number;
  maxRetries?: number;
  init?: RequestInit;
}

export type SubgraphConfigs = string | SubgraphConfig | (SubgraphConfig | string)[];

export interface SnapshotConfig {
  lastBlockNumber: number;
  timestamp: number;
}

export interface Filters {
  markets?: Hex[];
  users?: Address[];
  metaMorphos?: Address[];
}

export const parseSubgraphData = (
  subgraphData: any
): {
  markets: Market[];
  positions: Position[];
  metaMorphos: MetaMorpho[];
  metaMorphoPositions: MetaMorphoPosition[];
} => {
  let rawPositions = subgraphData.positions ?? [];
  let rawMarkets = subgraphData.markets ?? [];

  const metaMorphos = new Set<MetaMorpho>(
    subgraphData.metaMorphos?.map((m: any) => {
      if (Array.isArray(m.bluePositions)) {
        rawPositions = rawPositions.concat(
          m.bluePositions.filter(
            (pos: any) =>
              pos != undefined &&
              pos.id !== undefined &&
              pos.user?.id !== undefined &&
              pos.market?.id !== undefined &&
              pos.supplyShares !== undefined &&
              pos.borrowShares !== undefined &&
              pos.collateral !== undefined &&
              pos.supplyPoints !== undefined &&
              pos.borrowPoints !== undefined &&
              pos.collateralPoints !== undefined &&
              pos.lastUpdate !== undefined
          )
        );

        rawMarkets.push(
          m.bluePositions
            .map((p: any) => p.market)
            .filter(
              (m: any) =>
                m != undefined &&
                m.totalSupplyShares !== undefined &&
                m.totalBorrowShares !== undefined &&
                m.totalCollateral !== undefined &&
                m.totalSupplyPoints !== undefined &&
                m.totalBorrowPoints !== undefined &&
                m.totalCollateralPoints !== undefined &&
                m.lastUpdate !== undefined
            )
        );
      }
      return {
        id: getAddress(m.id),
        totalShares: BigInt(m.totalShares),
        totalPoints: BigInt(m.totalPoints),
        lastUpdate: BigInt(m.lastUpdate),
      };
    }) ?? []
  );

  const positions = new Set<Position>(
    rawPositions.map((p: any) => {
      if (
        p.market.totalSupplyShares !== undefined &&
        p.market.totalBorrowShares !== undefined &&
        p.market.totalCollateral !== undefined &&
        p.market.totalSupplyPoints !== undefined &&
        p.market.totalBorrowPoints !== undefined &&
        p.market.totalCollateralPoints !== undefined &&
        p.market.lastUpdate !== undefined
      ) {
        rawMarkets.push(p.market);
      }
      return {
        id: p.id,
        user: getAddress(p.user.id),
        market: p.market.id,
        supplyShares: BigInt(p.supplyShares),
        borrowShares: BigInt(p.borrowShares),
        collateral: BigInt(p.collateral),
        supplyPoints: BigInt(p.supplyPoints),
        borrowPoints: BigInt(p.borrowPoints),
        collateralPoints: BigInt(p.collateralPoints),
        lastUpdate: BigInt(p.lastUpdate),
      };
    }) ?? []
  );

  const markets = new Set<Market>(
    rawMarkets.map((m: any) => ({
      id: m.id,
      totalSupplyShares: BigInt(m.totalSupplyShares),
      totalBorrowShares: BigInt(m.totalBorrowShares),
      totalCollateral: BigInt(m.totalCollateral),
      totalSupplyPoints: BigInt(m.totalSupplyPoints),
      totalBorrowPoints: BigInt(m.totalBorrowPoints),
      totalCollateralPoints: BigInt(m.totalCollateralPoints),
      lastUpdate: BigInt(m.lastUpdate),
    }))
  );

  const metaMorphoPositions =
    subgraphData.metaMorphoPositions?.map((mp: any) => {
      if (
        mp.metaMorpho.totalShares !== undefined &&
        mp.metaMorpho.totalPoints !== undefined &&
        mp.metaMorpho.lastUpdate !== undefined
      ) {
        metaMorphos.add({
          id: mp.metaMorpho.id as Address,
          totalShares: BigInt(mp.metaMorpho.totalShares),
          totalPoints: BigInt(mp.metaMorpho.totalPoints),
          lastUpdate: BigInt(mp.metaMorpho.lastUpdate),
        });
      }

      return {
        id: mp.id,
        metaMorpho: getAddress(mp.metaMorpho.id),
        user: getAddress(mp.user.id),
        shares: BigInt(mp.shares),
        supplyPoints: BigInt(mp.supplyPoints),
        lastUpdate: BigInt(mp.lastUpdate),
      };
    }) ?? [];

  return {
    markets: [...markets],
    positions: [...positions],
    metaMorphos: [...metaMorphos],
    metaMorphoPositions,
  };
};

export const loadFromOneSubgraph = async (
  subgraph: SubgraphConfig,
  block: number,
  filters?: Filters
): Promise<State> => {
  if (!filters || Object.values(filters).every((f) => f === undefined || f.length === 0)) {
    return loadFullFromSubgraph(subgraph, block);
  }

  if (filters.users && filters.markets == undefined && filters.metaMorphos == undefined) {
    return loadFullForUsers(subgraph, block, filters.users);
  }
  if (filters.users && filters.markets && filters.metaMorphos == undefined) {
    return loadFullForUsersAndMarkets(subgraph, block, filters.users, filters.markets);
  }
  if (filters.users && filters.markets && filters.metaMorphos) {
    return loadFullForUsersAndMarketsAndMetaMorphos(
      subgraph,
      block,
      filters.users,
      filters.markets,
      filters.metaMorphos
    );
  }
  // now userFilters is empty
  if (filters.markets && filters.metaMorphos == undefined) {
    return loadFullForMarkets(subgraph, block, filters.markets);
  }
  if (filters.markets && filters.metaMorphos) {
    return loadFullForMarketsAndMetaMorphos(subgraph, block, filters.markets, filters.metaMorphos);
  }
  if (filters.metaMorphos) {
    return loadFullForMetaMorphos(subgraph, block, filters.metaMorphos);
  }
  throw new Error("Invalid filters");
};
export const loadFullFromSubgraphs = async (
  subgraphs: SubgraphConfigs,
  block: number,
  filters?: Filters
): Promise<State> => {
  if (!Array.isArray(subgraphs)) {
    subgraphs = [subgraphs];
  }
  const parsedConfigurations = subgraphs.map((subgraph) => {
    if (typeof subgraph === "string") {
      return { url: subgraph, querySize: 1000, maxRetries: 3 };
    } else {
      return subgraph;
    }
  });

  const states = await Promise.all(
    parsedConfigurations.map((subgraph) => loadFromOneSubgraph(subgraph, block, filters))
  );
  const state = states[0]!;

  if (parsedConfigurations.length === 1) {
    return state;
  }

  const areAllEqual = states.every((state) => areStatesEqual(state, state));
  if (!areAllEqual) {
    throw new Error("States are not equal");
  }
  return state;
};
export const getSnapshotFromSubgraph = async (
  subgraphs: SubgraphConfigs,
  { lastBlockNumber, timestamp }: SnapshotConfig,
  filters: Filters
) =>
  loadFullFromSubgraphs(subgraphs, lastBlockNumber, filters).then((r) =>
    distributeUpTo(r, BigInt(timestamp))
  );

export const getTimeframeFromSubgraph = async ({
  subgraphs,
  from,
  to,
  ...filters
}: {
  subgraphs: SubgraphConfigs;
  from?: SnapshotConfig;
  to: SnapshotConfig;
} & Filters) => {
  const [toState, fromState] = await Promise.all([
    getSnapshotFromSubgraph(subgraphs, to, filters),
    from ? getSnapshotFromSubgraph(subgraphs, from, filters) : undefined,
  ]);
  if (!from) {
    return toState;
  }
  if (!fromState) {
    throw new Error("From state is not defined");
  }
  return stateDiff(fromState, toState);
};

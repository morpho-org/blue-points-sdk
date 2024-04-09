import { InMemoryStateManager, State, StateManager } from "../stateManager";
import { fetchSubgraph } from "../subgraph";
import { Market, MetaMorpho, MetaMorphoPosition, Position } from "../types";
import { getAddress } from "viem";
import { areStatesEqual, distributeUpTo, stateDiff } from "../distributors";
import { getConfig } from "../index";

const query = `query All($block: Int! 
  $first: Int!
  $lastMarketsId: ID!
  $lastPositionsId: ID!
  $lastMetaMorphosId: ID! 
  $lastMetaMorphoPositionsId: ID! 
  ) {
  markets(first: $first block: {number: $block} where: {id_gt: $lastMarketsId} orderBy: id) {
    id
    loanToken
    collateralToken
    
    totalSupplyShares
    totalBorrowShares
    totalCollateral
    totalSupplyShards
    totalBorrowShards
    totalCollateralShards
    totalSupplyPoints
    supplyPointsIndex
    totalBorrowPoints
    borrowPointsIndex
    totalCollateralPoints
    collateralPointsIndex
    lastUpdate
  }
  positions(first: $first block: {number: $block} where: {id_gt: $lastPositionsId} orderBy: id) {
    id
    user {id}
    market {id}
    supplyShares
    borrowShares
    collateral
    supplyShards
    borrowShards
    collateralShards
    supplyPoints
    lastSupplyPointsIndex
    borrowPoints
    lastBorrowPointsIndex
    collateralPoints
    lastCollateralPointsIndex
    lastUpdate
  }

  metaMorphos(first: $first block: {number: $block} where: {id_gt: $lastMetaMorphosId} orderBy: id) {
    id
    totalShares
    totalShards
    totalPoints
    pointsIndex
    lastUpdate
  }
  
  metaMorphoPositions(first: $first block: {number: $block} where: {id_gt: $lastMetaMorphoPositionsId} orderBy: id) {
    id
    metaMorpho {id}
    user {id}
    shares
    supplyShards
    supplyPoints
    lastSupplyPointsIndex
    lastUpdate
  }
}`;
export const parseSubgraphData = (
  subgraphData: any
): {
  markets: Market[];
  positions: Position[];
  metaMorphos: MetaMorpho[];
  metaMorphoPositions: MetaMorphoPosition[];
} => ({
  markets:
    subgraphData.markets?.map((m: any) => ({
      id: m.id,
      totalSupplyShares: BigInt(m.totalSupplyShares),
      totalBorrowShares: BigInt(m.totalBorrowShares),
      totalCollateral: BigInt(m.totalCollateral),
      totalSupplyShards: BigInt(m.totalSupplyShards),
      totalBorrowShards: BigInt(m.totalBorrowShards),
      totalCollateralShards: BigInt(m.totalCollateralShards),
      totalSupplyPoints: BigInt(m.totalSupplyPoints),
      supplyPointsIndex: BigInt(m.supplyPointsIndex),
      totalBorrowPoints: BigInt(m.totalBorrowPoints),
      borrowPointsIndex: BigInt(m.borrowPointsIndex),
      totalCollateralPoints: BigInt(m.totalCollateralPoints),
      collateralPointsIndex: BigInt(m.collateralPointsIndex),
      lastUpdate: BigInt(m.lastUpdate),
    })) ?? [],
  positions:
    subgraphData.positions?.map((p: any) => ({
      id: p.id,
      user: getAddress(p.user.id),
      market: p.market.id,
      supplyShares: BigInt(p.supplyShares),
      borrowShares: BigInt(p.borrowShares),
      collateral: BigInt(p.collateral),
      supplyShards: BigInt(p.supplyShards),
      borrowShards: BigInt(p.borrowShards),
      collateralShards: BigInt(p.collateralShards),
      supplyPoints: BigInt(p.supplyPoints),
      lastSupplyPointsIndex: BigInt(p.lastSupplyPointsIndex),
      borrowPoints: BigInt(p.borrowPoints),
      lastBorrowPointsIndex: BigInt(p.lastBorrowPointsIndex),
      collateralPoints: BigInt(p.collateralPoints),
      lastCollateralPointsIndex: BigInt(p.lastCollateralPointsIndex),
      lastUpdate: BigInt(p.lastUpdate),
    })) ?? [],
  metaMorphos:
    subgraphData.metaMorphos?.map((m: any) => ({
      id: getAddress(m.id),
      totalShares: BigInt(m.totalShares),
      totalShards: BigInt(m.totalShards),
      totalPoints: BigInt(m.totalPoints),
      pointsIndex: BigInt(m.pointsIndex),
      lastUpdate: BigInt(m.lastUpdate),
    })) ?? [],
  metaMorphoPositions:
    subgraphData.metaMorphoPositions?.map((mp: any) => ({
      id: mp.id,
      metaMorpho: getAddress(mp.metaMorpho.id),
      user: getAddress(mp.user.id),
      shares: BigInt(mp.shares),
      supplyShards: BigInt(mp.supplyShards),
      supplyPoints: BigInt(mp.supplyPoints),
      lastSupplyPointsIndex: BigInt(mp.lastSupplyPointsIndex),
      lastUpdate: BigInt(mp.lastUpdate),
    })) ?? [],
});

export interface SubgraphConfig {
  url: string;
  querySize?: number;
  maxRetries?: number;
}
export const loadFullFromSubgraph = async (
  subgraph: SubgraphConfig,
  block: number
): Promise<State> => {
  let hasMore = true;
  const lastIds = {
    lastMarketsId: "",
    lastPositionsId: "",
    lastMetaMorphosId: "",
    lastMetaMorphoPositionsId: "",
  };

  const data: {
    markets: Market[];
    positions: Position[];
    metaMorphos: MetaMorpho[];
    metaMorphoPositions: MetaMorphoPosition[];
  } = {
    markets: [],
    positions: [],
    metaMorphos: [],
    metaMorphoPositions: [],
  };
  const querySize = subgraph.querySize ?? 1000;

  while (hasMore) {
    const fetch = () =>
      fetchSubgraph(subgraph.url, query, {
        block,
        first: querySize,
        ...lastIds,
      }).then(parseSubgraphData);

    let retries = 0;
    let isSuccessFull = false;
    while (retries < (subgraph?.maxRetries ?? 3) && !isSuccessFull) {
      const fetchingResult = await fetch().catch((err) => {
        console.error(`Error fetching subgraph ${subgraph.url} retrying...`, err);
        retries++;
      });
      if (fetchingResult) {
        isSuccessFull = true;
        const { markets, metaMorphoPositions, metaMorphos, positions } = fetchingResult;

        data.markets.push(...markets);
        data.positions.push(...positions);
        data.metaMorphos.push(...metaMorphos);
        data.metaMorphoPositions.push(...metaMorphoPositions);
        hasMore = Object.values([markets, metaMorphoPositions, metaMorphos, positions]).some(
          (d: any) => d.length === querySize
        );

        lastIds.lastMarketsId = markets[markets.length - 1]?.id ?? lastIds.lastMarketsId;

        lastIds.lastPositionsId = positions[positions.length - 1]?.id ?? lastIds.lastPositionsId;
        lastIds.lastMetaMorphosId =
          metaMorphos[metaMorphos.length - 1]?.id ?? lastIds.lastMetaMorphosId;
        lastIds.lastMetaMorphoPositionsId =
          metaMorphoPositions[metaMorphoPositions.length - 1]?.id ??
          lastIds.lastMetaMorphoPositionsId;
      }
    }
  }

  const markets = Object.fromEntries(data.markets.map((m) => [m.id, m]));

  const positions = Object.fromEntries(data.positions.map((p) => [p.id, p]));

  const metaMorphos = Object.fromEntries(data.metaMorphos.map((m) => [m.id, m]));

  const metaMorphoPositions = Object.fromEntries(data.metaMorphoPositions.map((mp) => [mp.id, mp]));

  return {
    markets,
    positions,
    metaMorphos,
    metaMorphoPositions,
  };
};

export type SubgraphConfigs = string | SubgraphConfig | (SubgraphConfig | string)[];
const stateCache = new Map<
  number,
  {
    state: State;
    quorum: number;
  }
>();
export const loadFullFromSubgraphs = async (
  subgraphs: SubgraphConfigs,
  block: number,
  config?: {
    quorum: number;
  }
): Promise<StateManager> => {
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
  if (config?.quorum != null && config.quorum > parsedConfigurations.length)
    throw new Error("Quorum is higher than the number of subgraphs");

  const sdkConfig = getConfig();
  const quorum = config?.quorum ?? parsedConfigurations.length;

  if (sdkConfig.cacheEnabled && stateCache.has(block)) {
    const stateFromCache = stateCache.get(block)!;
    if (stateFromCache.quorum >= quorum) return new InMemoryStateManager(stateFromCache.state);
  }

  const states = await Promise.all(
    parsedConfigurations.map((subgraph) => loadFullFromSubgraph(subgraph, block))
  );
  if (quorum === 1) {
    if (sdkConfig.cacheEnabled) stateCache.set(block, { state: states[0]!, quorum: 1 });

    return new InMemoryStateManager(states[0]!);
  }

  const diffStatesIndexes: Record<number, number> = {};
  for (let i = 1; i < states.length; i++) {
    // find the first state that is the same
    const firstEqual = states.findIndex((state) => areStatesEqual(states[0]!, state));
    diffStatesIndexes[i] = firstEqual;
  }
  // group per number of states that are the same
  const grouped = Object.entries(
    Object.entries(diffStatesIndexes).reduce(
      (acc, [, value]) => {
        acc[value] = acc[value] ?? 0;
        acc[value] += 1;
        return acc;
      },
      {} as Record<number, number>
    )
  ).sort(([, a], [, b]) => b - a)[0]!;

  if (grouped[1] < quorum) {
    throw new Error("Not enough subgraphs with the same state");
  }
  const state = states[+grouped[0]!]!;
  if (sdkConfig.cacheEnabled) stateCache.set(block, { state, quorum: grouped[1] });

  return new InMemoryStateManager(state);
};

export interface SnapshotConfig {
  lastBlockNumber: number;
  timestamp: number;
}

export const getSnapshotFromSubgraph = async (
  subgraphs: SubgraphConfigs,
  { lastBlockNumber, timestamp }: SnapshotConfig
) =>
  loadFullFromSubgraphs(subgraphs, lastBlockNumber)
    .then((r) => r.dumpState())
    .then((r) => distributeUpTo(r, BigInt(timestamp)));

export const getTimeframeFromSubgraph = async ({
  subgraphs,
  from,
  to,
}: {
  subgraphs: SubgraphConfigs;
  from?: SnapshotConfig;
  to: SnapshotConfig;
}) => {
  const [toState, fromState] = await Promise.all([
    getSnapshotFromSubgraph(subgraphs, to),
    from ? getSnapshotFromSubgraph(subgraphs, from) : undefined,
  ]);
  if (!from) {
    return toState;
  }
  if (!fromState) {
    throw new Error("From state is not defined");
  }
  return stateDiff(fromState, toState);
};

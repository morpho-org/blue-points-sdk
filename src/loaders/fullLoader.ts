import { State } from "../client";
import { getConfig } from "../index";
import { fetchSubgraph } from "../subgraph";
import { Market, MetaMorpho, MetaMorphoPosition, Position } from "../types";

import { parseSubgraphData, SubgraphConfig } from "./loader";

export const fullLoaderQuery = `query All($block: Int! 
  $first: Int!
  $lastMarketsId: ID!
  $lastPositionsId: ID!
  $lastMetaMorphosId: ID! 
  $lastMetaMorphoPositionsId: ID! 
  ) {
  markets(first: $first block: {number: $block} where: {id_gt: $lastMarketsId} orderBy: id) {
    id
    totalSupplyShares
    totalBorrowShares
    totalCollateral
    totalSupplyPoints
    totalBorrowPoints
    totalCollateralPoints
    lastUpdate
  }
  positions(first: $first block: {number: $block} where: {id_gt: $lastPositionsId} orderBy: id) {
    id
    user {id}
    market {id}
    supplyShares
    borrowShares
    collateral
    supplyPoints
    borrowPoints
    collateralPoints
    lastUpdate
  }

  metaMorphos(first: $first block: {number: $block} where: {id_gt: $lastMetaMorphosId} orderBy: id) {
    id
    totalShares
    totalPoints
    lastUpdate
  }
  
  metaMorphoPositions(first: $first block: {number: $block} where: {id_gt: $lastMetaMorphoPositionsId} orderBy: id) {
    id
    metaMorpho {id}
    user {id}
    shares
    supplyPoints
    lastUpdate
  }
}`;

const subgraphCache = new Map<string, State>();

export const resetCache = () => void subgraphCache.clear();

export const loadFullFromSubgraph = async (
  subgraph: SubgraphConfig,
  block: number
): Promise<State> => {
  const cachedFetch = async () => {
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
      let retries = 0;
      const fetch = () =>
        fetchSubgraph(
          subgraph.url,
          fullLoaderQuery,
          {
            block,
            first: querySize,
            ...lastIds,
          },
          subgraph.init
        ).then(parseSubgraphData);

      let isSuccessFull = false;
      while (!isSuccessFull) {
        const fetchingResult = await fetch().catch((err) => {
          if (retries >= (subgraph?.maxRetries ?? 3)) {
            throw err;
          }
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

    const metaMorphoPositions = Object.fromEntries(
      data.metaMorphoPositions.map((mp) => [mp.id, mp])
    );

    return {
      markets,
      positions,
      metaMorphos,
      metaMorphoPositions,
    };
  };
  const config = getConfig();
  const cacheKey = `${subgraph.url}-${block}`;
  if (config.cacheEnabled && subgraphCache.has(cacheKey)) {
    return subgraphCache.get(cacheKey)!;
  }
  const state = await cachedFetch();
  if (config.cacheEnabled) subgraphCache.set(cacheKey, state);
  return state;
};

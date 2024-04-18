import { Address } from "viem";

import { State } from "../client";
import { getConfig } from "../index";
import { fetchSubgraph } from "../subgraph";
import { Market, MetaMorpho, MetaMorphoPosition, Position } from "../types";

import { parseSubgraphData, SubgraphConfig } from "./loader";

// TODO: paginate the metaMorpho blue positions (here it loads only the first 1000)
export const marketsLoaderQuery = `query All($block: Int! 
  $first: Int!
  $lastPositionsId: ID!
  $markets: [ID!]!
  ) {
  positions(first: $first block: {number: $block} where: {id_gt: $lastPositionsId, market_in: $markets} orderBy: id) {
    id
    user {id}
    market {
      id 
      totalSupplyShares
      totalBorrowShares
      totalCollateral
      totalSupplyPoints
      totalBorrowPoints
      totalCollateralPoints
      lastUpdate
    }
    supplyShares
    borrowShares
    collateral
    supplyPoints
    borrowPoints
    collateralPoints
    lastUpdate
    
    ofMetaMorpho {id}
  }

}`;

export const metaMorphosLoaderQuery = `query All($block: Int!
  $first: Int!
  $lastMetaMorphoPositionsId: ID!
$metaMorphos: [ID!]!
  ) {
  metaMorphoPositions(first: $first block: {number: $block} where: {
    id_gt: $lastMetaMorphoPositionsId 
    metaMorpho_in: $metaMorphos
  } orderBy: id) {
    id
    metaMorpho {
      id
      totalShares
      totalPoints
      lastUpdate
      bluePositions(first: 1000) {
        id
        user {id}
        market {
          id 
          totalSupplyShares
          totalBorrowShares
          totalCollateral
          totalSupplyPoints
          totalBorrowPoints
          totalCollateralPoints
          lastUpdate
        }
        supplyShares
        borrowShares
        collateral
        supplyPoints
        borrowPoints
        collateralPoints
        lastUpdate
      }
    }
    user {id}
    shares
    supplyPoints
    lastUpdate
  }
}`;

const subgraphCache = new Map<string, State>();

export const resetCache = () => void subgraphCache.clear();

export const loadFullForMarkets = async (
  subgraph: SubgraphConfig,
  block: number,
  marketsFilter: Address[]
): Promise<State> => {
  const cachedFetch = async () => {
    let hasMore = true;
    const lastPositionIds = {
      lastPositionsId: "",
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

    const metaMorphosToFetch: Address[] = [];
    while (hasMore) {
      let retries = 0;

      const fetch = () =>
        fetchSubgraph(
          subgraph.url,
          marketsLoaderQuery,
          {
            block,
            first: querySize,
            markets: marketsFilter,
            ...lastPositionIds,
          },
          subgraph.init
        ).then((data: any) => {
          metaMorphosToFetch.push(
            ...new Set<Address>(data.positions.map((p: any) => p.ofMetaMorpho?.id).filter(Boolean))
          );
          return parseSubgraphData(data);
        });

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
          const { markets, positions } = fetchingResult;

          data.markets.push(...markets);
          data.positions.push(...positions);

          hasMore = Object.values([markets, positions]).some((d: any) => d.length === querySize);

          lastPositionIds.lastPositionsId =
            positions[positions.length - 1]?.id ?? lastPositionIds.lastPositionsId;
        }
      }
    }

    hasMore = true;
    const lastMetaMorphoPositionIds = {
      lastMetaMorphoPositionsId: "",
    };
    while (hasMore) {
      let retries = 0;

      const fetch = () =>
        fetchSubgraph(
          subgraph.url,
          metaMorphosLoaderQuery,
          {
            block,
            first: querySize,
            metaMorphos: metaMorphosToFetch,
            ...lastMetaMorphoPositionIds,
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
          const { metaMorphoPositions, metaMorphos } = fetchingResult;

          data.metaMorphos.push(...metaMorphos);
          data.metaMorphoPositions.push(...metaMorphoPositions);
          hasMore = Object.values([metaMorphoPositions, metaMorphos]).some(
            (d: any) => d.length === querySize
          );

          lastMetaMorphoPositionIds.lastMetaMorphoPositionsId =
            metaMorphoPositions[metaMorphoPositions.length - 1]?.id ??
            lastMetaMorphoPositionIds.lastMetaMorphoPositionsId;
        }
      }
    }
    const markets = Object.fromEntries([...new Set(data.markets)].map((m) => [m.id, m]));

    const positions = Object.fromEntries([...new Set(data.positions)].map((p) => [p.id, p]));

    const metaMorphos = Object.fromEntries([...new Set(data.metaMorphos)].map((m) => [m.id, m]));

    const metaMorphoPositions = Object.fromEntries(
      [...new Set(data.metaMorphoPositions)].map((mp) => [mp.id, mp])
    );

    return {
      markets,
      positions,
      metaMorphos,
      metaMorphoPositions,
    };
  };
  const config = getConfig();
  const cacheKey = `${subgraph.url}-${block}-${JSON.stringify(marketsFilter)}`;
  if (config.cacheEnabled && subgraphCache.has(cacheKey)) {
    return subgraphCache.get(cacheKey)!;
  }
  const state = await cachedFetch();
  if (config.cacheEnabled) subgraphCache.set(cacheKey, state);
  return state;
};

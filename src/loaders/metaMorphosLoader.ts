import { Address } from "viem";

import { State } from "../client";
import { getConfig } from "../index";
import { fetchSubgraph } from "../subgraph";
import { Market, MetaMorpho, MetaMorphoPosition, Position } from "../types";

import { parseSubgraphData, SubgraphConfig } from "./loader";

// TODO: paginate the metaMorpho blue positions (here it loads only the first 1000)
export const metaMorphosLoaderQuery = `query All($block: Int! 
  $first: Int!
  $lastMetaMorphoPositionsId: ID! 
  $markets: [ID!]!
  $metaMorphos: [ID!]!
  ) {
  
  metaMorphoPositions(first: $first block: {number: $block} where: {id_gt: $lastMetaMorphoPositionsId metaMorpho_in: $metaMorphos} orderBy: id) {
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

export const loadFullForMetaMorphos = async (
  subgraph: SubgraphConfig,
  block: number,
  metaMorphosFilter: Address[]
): Promise<State> => {
  const cachedFetch = async () => {
    let hasMore = true;
    const lastIds = {
      lastMetaMorphoPositionsId: "",
    };

    const data: {
      metaMorphos: MetaMorpho[];
      metaMorphoPositions: MetaMorphoPosition[];
    } = {
      metaMorphos: [],
      metaMorphoPositions: [],
    };
    const querySize = subgraph.querySize ?? 1000;

    while (hasMore) {
      let retries = 0;
      const fetch = () =>
        fetchSubgraph(
          subgraph.url,
          metaMorphosLoaderQuery,
          {
            block,
            first: querySize,
            metaMorphos: metaMorphosFilter,
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
          const { metaMorphoPositions, metaMorphos } = fetchingResult;

          data.metaMorphos.push(...metaMorphos);
          data.metaMorphoPositions.push(...metaMorphoPositions);
          hasMore = Object.values([metaMorphoPositions, metaMorphos]).some(
            (d: any) => d.length === querySize
          );

          lastIds.lastMetaMorphoPositionsId =
            metaMorphoPositions[metaMorphoPositions.length - 1]?.id ??
            lastIds.lastMetaMorphoPositionsId;
        }
      }
    }
    const metaMorphos = Object.fromEntries([...new Set(data.metaMorphos)].map((m) => [m.id, m]));

    const metaMorphoPositions = Object.fromEntries(
      [...new Set(data.metaMorphoPositions)].map((mp) => [mp.id, mp])
    );

    return {
      markets: {},
      positions: {},
      metaMorphos,
      metaMorphoPositions,
    };
  };
  const config = getConfig();
  const cacheKey = `${subgraph.url}-${block}-${JSON.stringify({ metaMorphosFilter })}`;
  if (config.cacheEnabled && subgraphCache.has(cacheKey)) {
    return subgraphCache.get(cacheKey)!;
  }
  const state = await cachedFetch();
  if (config.cacheEnabled) subgraphCache.set(cacheKey, state);
  return state;
};

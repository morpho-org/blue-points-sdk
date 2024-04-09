import { InMemoryStateManager } from "../stateManager/StateManager";
import { fetchSubgraph } from "../subgraph";
import { Market, MetaMorpho, MetaMorphoPosition, Position } from "../types";

import { parseSubgraphData } from "./fullLoader";

const userPositionsQuery = `query UserRewards(
  $block: Int!
  $first: Int!
  $user: String!
  $lastPositionsId: ID!
  $lastMetaMorphoPositionsId: ID!
  ){

  metaMorphoPositions(first: $first block: {number: $block} where: {
    user: $user
    id_gt: $lastMetaMorphoPositionsId
  } orderBy: id) {
    id
    metaMorpho {id}
    user {id}
    shares
    supplyShards
    supplyPoints
    lastSupplyPointsIndex
    lastUpdate
  }
  positions(first: $first block: {number: $block} where: {
    user: $user
    id_gt: $lastPositionsId
  } orderBy: id) {
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
}`;

const metaMorphoQuery = `query MetaMorphos(
  $block: Int!
  $first: Int!
  $metamorphos: [String!]!
  $lastPositionsId: ID!
  ){

  metaMorphos(first: $first block: {number: $block} where: {
  id_in: $metamorphos
  } orderBy: id) {
    id
    totalShares
    totalShards
    totalPoints
    pointsIndex
    lastUpdate
  }
  positions(first: $first block: {number: $block} where: {
    user_in: $metamorphos 
    id_gt: $lastPositionsId
  } orderBy: id) {
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
}`;

const marketsQuery = `query Markets(
    $block: Int!
    $first: Int!
    $markets: [String!]!
    ){
    
    markets(first: $first block: {number: $block} where: {
    id_in: $markets
    } orderBy: id) {
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
    }`;

/**
 * Load all the data to compute the user rewards
 * on Morpho & on MetaMorpho
 * It includes the metamorphos where the user is involved in
 * It includes the metamorpho positions where the user is involved in
 * It includes the markets where the user or the metamorphos are involved in
 * It includes the positions of the user & the positions of the metamorphos where the user is involved in
 *
 * It requires at least 3 queries to the subgraph
 */
export const loadFromSubgraphForUser = async (subgraphUrl: string, user: string, block: number) => {
  // first we fetch the user positions
  let hasMore = true;
  const lastIds = {
    lastMarketsId: "",
    lastPositionsId: "",
    lastMetaMorphosId: "",
    lastMetaMorphoPositionsId: "",
  };
  const first = 1000;

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
  while (hasMore) {
    const { metaMorphoPositions, positions } = await fetchSubgraph(
      subgraphUrl,
      userPositionsQuery,
      {
        block,
        first,
        user,
        lastPositionsId: lastIds.lastPositionsId,
        lastMetaMorphoPositionsId: lastIds.lastMetaMorphoPositionsId,
      }
    ).then(parseSubgraphData);
    data.metaMorphoPositions.push(...metaMorphoPositions);
    data.positions.push(...positions);
    hasMore = metaMorphoPositions.length === first || positions.length === first;
    lastIds.lastMetaMorphoPositionsId =
      metaMorphoPositions[metaMorphoPositions.length - 1]?.id ?? lastIds.lastMetaMorphoPositionsId;
    lastIds.lastPositionsId = positions[positions.length - 1]?.id ?? lastIds.lastPositionsId;
  }
  // then we fetch the metamorpho data, metamorpho positions on blue
  // we handle the case where there is more than 1k metamorphos
  // we handle the case where there is more than 1k morpho positions for a set of metamorphos
  const FILTER_LENGTH = 1000;

  const allMetaMorphos = [...new Set(data.metaMorphoPositions.map((p) => p.metaMorpho))];

  for (let i = 0; i < allMetaMorphos.length; i += FILTER_LENGTH) {
    const metamorphos = allMetaMorphos.slice(i, i + FILTER_LENGTH);
    hasMore = true;

    const lastMMIds = {
      lastPositionsId: "",
      lastMetaMorphosId: "",
    };
    while (hasMore) {
      const { metaMorphos, positions } = await fetchSubgraph(subgraphUrl, metaMorphoQuery, {
        block,
        first,
        metamorphos,
        lastPositionsId: lastMMIds.lastPositionsId,
      }).then(parseSubgraphData);
      data.metaMorphos.push(...metaMorphos);
      data.positions.push(...positions);
      hasMore = metaMorphos.length === first || positions.length === first;
      lastMMIds.lastMetaMorphosId =
        metaMorphos[metaMorphos.length - 1]?.id ?? lastMMIds.lastMetaMorphosId;
      lastMMIds.lastPositionsId = positions[positions.length - 1]?.id ?? lastMMIds.lastPositionsId;
    }
  }
  // and now we fetch the markets data
  const allMarkets = [...new Set(data.positions.map((p) => p.market))];

  for (let i = 0; i < allMarkets.length; i += FILTER_LENGTH) {
    const marketsList = allMarkets.slice(i, i + FILTER_LENGTH);
    hasMore = true;
    while (hasMore) {
      const { markets } = await fetchSubgraph(subgraphUrl, marketsQuery, {
        block,
        first,
        markets: marketsList,
      }).then(parseSubgraphData);
      data.markets.push(...markets);
      hasMore = markets.length === first;
    }
  }

  const markets = Object.fromEntries(data.markets.map((m) => [m.id, m]));
  const positions = Object.fromEntries(data.positions.map((p) => [p.id, p]));
  const metaMorphos = Object.fromEntries(data.metaMorphos.map((m) => [m.id, m]));
  const metaMorphoPositions = Object.fromEntries(data.metaMorphoPositions.map((p) => [p.id, p]));
  return new InMemoryStateManager({
    markets,
    positions,
    metaMorphos,
    metaMorphoPositions,
  });
};

import { Address, Hex } from "viem";

import { PointsState } from "../client/state";
import { redistributeAll } from "../distributors";
import { getTimeframeFromSubgraph, SnapshotConfig, SubgraphConfigs } from "../loaders";

import { computeMerkleTree } from "./merkleTree";

export interface MarketProgramConfig {
  market: Hex;
  rewardToken: Address;

  tokensToDistributeSupplySide?: bigint;
  tokensToDistributeBorrowSide?: bigint;
  tokensToDistributeCollateralSide?: bigint;
}

export interface MarketUserRewards {
  user: Address;
  rewardToken: Address;
  rewardsSupplySide: bigint;
  rewardsBorrowSide: bigint;
  rewardsCollateralSide: bigint;
}

export interface UserRewards {
  rewardToken: Address;
  user: Address;
  rewards: bigint;
}
export const distributeMarketRewards = (
  state: PointsState,
  {
    market,
    rewardToken,
    tokensToDistributeBorrowSide = 0n,
    tokensToDistributeCollateralSide = 0n,
    tokensToDistributeSupplySide = 0n,
  }: MarketProgramConfig
) => {
  const marketState = state.markets[market]!;

  let totalDistributedSupplySide = 0n;
  let totalDistributedBorrowSide = 0n;
  let totalDistributedCollateralSide = 0n;

  const usersRewards = Object.values(state.positions)
    .filter(({ market: m }) => m === market)
    .map(({ user, supplyPoints, borrowPoints, collateralPoints }) => {
      const userTokensSupplySide =
        (supplyPoints * tokensToDistributeSupplySide) / marketState.totalSupplyPoints;
      const userTokensBorrowSide =
        (borrowPoints * tokensToDistributeBorrowSide) / marketState.totalBorrowPoints;
      const userTokensCollateralSide =
        (collateralPoints * tokensToDistributeCollateralSide) / marketState.totalCollateralPoints;

      totalDistributedSupplySide += userTokensSupplySide;
      totalDistributedBorrowSide += userTokensBorrowSide;
      totalDistributedCollateralSide += userTokensCollateralSide;

      return {
        user,
        rewardToken,
        rewardsSupplySide: userTokensSupplySide,
        rewardsBorrowSide: userTokensBorrowSide,
        rewardsCollateralSide: userTokensCollateralSide,
      };
    });

  return {
    usersRewards,
    totalDistributedBorrowSide,
    totalDistributedCollateralSide,
    totalDistributedSupplySide,
  };
};

export const mergeMarketRewards = (marketRewards: MarketUserRewards[]) =>
  marketRewards.map(
    ({ user, rewardToken, rewardsSupplySide, rewardsBorrowSide, rewardsCollateralSide }) => ({
      user,
      rewardToken,
      rewards: rewardsBorrowSide + rewardsCollateralSide + rewardsSupplySide,
    })
  );

export interface MetaMorphoProgramConfig {
  metaMorphoAddress: Address;
  rewardToken: Address;
  tokensToDistributeSupplySide: bigint;
}

export const distributeMetaMorphoRewards = (
  state: PointsState,
  { metaMorphoAddress, tokensToDistributeSupplySide, rewardToken }: MetaMorphoProgramConfig
) => {
  const metaMorpho = state.metaMorphos[metaMorphoAddress]!;
  let totalDistributed = 0n;

  const usersRewards = Object.values(state.metaMorphoPositions)
    .filter(({ metaMorpho }) => metaMorpho === metaMorphoAddress)
    .map(({ user, supplyPoints }) => {
      const userTokensSupplySide =
        (supplyPoints * tokensToDistributeSupplySide) / metaMorpho.totalPoints;
      totalDistributed += userTokensSupplySide;
      return {
        user,
        rewardToken,
        rewards: userTokensSupplySide,
      };
    });

  return {
    usersRewards,
    totalDistributed,
  };
};

export interface TimeBoundedMarketProgram extends MarketProgramConfig {
  from: SnapshotConfig;
  to: SnapshotConfig;
}

export const computeTimeBoundedMarketRewards = async (
  subgraphs: SubgraphConfigs,
  { from, to, ...config }: TimeBoundedMarketProgram
) => {
  const state = await getTimeframeFromSubgraph({
    subgraphs,
    to,
    from,
  });

  const fullyRedistributedState = redistributeAll(state);

  const { usersRewards } = distributeMarketRewards(fullyRedistributedState, config);

  const mergedUsersRewards = mergeMarketRewards(usersRewards);
  return {
    rewards: mergedUsersRewards,
    ...computeMerkleTree(mergedUsersRewards),
  };
};

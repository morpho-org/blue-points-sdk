import { ShardsState } from "../stateManager/state";
import { Address, Hex } from "viem";
import { getTimeframeFromSubgraph, SnapshotConfig, SubgraphConfigs } from "../loaders";
import { redistributeAll } from "../distributors";
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
  state: ShardsState,
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
    .map(({ user, supplyShards, borrowShards, collateralShards }) => {
      const userTokensSupplySide =
        (supplyShards * tokensToDistributeSupplySide) / marketState.totalSupplyShards;
      const userTokensBorrowSide =
        (borrowShards * tokensToDistributeBorrowSide) / marketState.totalBorrowShards;
      const userTokensCollateralSide =
        (collateralShards * tokensToDistributeCollateralSide) / marketState.totalCollateralShards;

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
  state: ShardsState,
  { metaMorphoAddress, tokensToDistributeSupplySide, rewardToken }: MetaMorphoProgramConfig
) => {
  const metaMorpho = state.metaMorphos[metaMorphoAddress]!;
  let totalDistributed = 0n;

  const usersRewards = Object.values(state.metaMorphoPositions)
    .filter(({ metaMorpho }) => metaMorpho === metaMorphoAddress)
    .map(({ user, supplyShards }) => {
      const userTokensSupplySide =
        (supplyShards * tokensToDistributeSupplySide) / metaMorpho.totalShards;
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

  const rewards = distributeMarketRewards(fullyRedistributedState, config).usersRewards;

  const usersRewards = mergeMarketRewards(rewards);
  return {
    rewards,
    ...computeMerkleTree(usersRewards),
  };
};

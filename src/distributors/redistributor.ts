import { Address, Hex } from "viem";

import { blacklistingAddress, ShardsState, cloneShardsState } from "..";

import { MORPHO_ADDRESS } from "./constants";
import { getPositionId, initPositionShards } from "./morphoDistributor";
import { freemmer } from "./utils";

/**
 * Redistribute the market points of a vault to the users of the vault
 *
 * Map over the metamorpho positions and redistribute the points to the users of the vault
 */
export const redistributeOneMarketToOneMetaMorpho = (
  _state: ShardsState,
  mmAddress: Address,
  marketId: Hex
) =>
  freemmer.produce(_state, (state) => {
    // map over the non draft object for perf optimization
    const mmPositions = Object.values(_state.metaMorphoPositions)
      .filter((position) => position.metaMorpho === mmAddress)
      .map((position) => position);

    const mmMarketPositionId = getPositionId(marketId, mmAddress);
    const totalVaultMarketShards = state.positions[mmMarketPositionId]?.supplyShards ?? 0n; // TODO: do we want to also redistribute the collateral shards due to donation?
    const metaMorphoShards = state.metaMorphos[mmAddress]!.totalShards;

    if (totalVaultMarketShards === 0n || metaMorphoShards === 0n) return;

    let shardsRedistributed = 0n;

    mmPositions.forEach(({ user, supplyShards }) => {
      const userMarketPosId = getPositionId(marketId, user);

      // We concat the previous market points of the user with the points accrued through the metamorpho vault.
      const userMarketPosition =
        state.positions[userMarketPosId] ?? initPositionShards(marketId, user);
      const userShardsRedistribution = (totalVaultMarketShards * supplyShards) / metaMorphoShards;

      userMarketPosition.supplyShards += userShardsRedistribution;

      shardsRedistributed += userShardsRedistribution;

      state.positions[userMarketPosId] = userMarketPosition;
    });

    // The vault keep the roundings for itself
    state.positions[mmMarketPositionId]!.supplyShards -= shardsRedistributed;
  });

/**
 * Redistribute the points of the metamorpho to the users of the vault
 *
 * Map over the vault positions into the different markets and redistribute the points to the users of the vault
 */
export const redistributeOneMetaMorpho = (state: ShardsState, mmAddress: Address) => {
  const vaultMarkets = Object.values(state.positions)
    .filter(({ user }) => user === mmAddress)
    .map(({ market }) => market);

  return vaultMarkets.reduce(
    (resultedState, market) =>
      redistributeOneMarketToOneMetaMorpho(resultedState, mmAddress, market),
    cloneShardsState(state)
  );
};
/**
 * Redistribute the market points to the MetaMorpho users.
 *
 * Map over each vault, check the metamorpho positions and redistribute the points to the users of the vault.
 */
export const redistributeMetaMorpho = (state: ShardsState): ShardsState =>
  Object.keys(state.metaMorphos).reduce(
    (resultedState, metaMorpho) => redistributeOneMetaMorpho(resultedState, metaMorpho as Address),
    cloneShardsState(state)
  );

/**
 * We first need to redistribute to the users that have used the vault as collateral
 * And then, we spread the vault market points to the vault users.
 * Finally, we blacklist the remaining points of blue (due to roundings during the redistribution)
 */
export const redistributeAll = (state: ShardsState) =>
  blacklistingAddress(redistributeMetaMorpho(state), MORPHO_ADDRESS);

import { Address } from "viem";

import { cloneShardsState, ShardsState } from "../stateManager";

export const blacklistingAddress = (
  state: ShardsState,
  blacklistedAddresses: Address[] | Address
) => {
  if (!Array.isArray(blacklistedAddresses)) {
    blacklistedAddresses = [blacklistedAddresses];
  }
  const blacklisted = new Set(blacklistedAddresses);

  // We first blacklist all the blue positions that belong to the blacklisted addresses
  const blacklistedPositionsState = Object.values(state.positions)
    .filter(({ user }) => blacklisted.has(user))
    .reduce(
      (resultingState, { collateralShards, market: marketId, borrowShards, supplyShards, id }) => {
        const market = resultingState.markets[marketId]!;
        market.totalCollateralShards -= collateralShards;
        market.totalBorrowShards -= borrowShards;
        market.totalSupplyShards -= supplyShards;

        delete resultingState.positions[id];

        return resultingState;
      },
      cloneShardsState(state)
    );

  // We then blacklist all the metamorpho positions that belong to the blacklisted addresses
  return Object.values(state.metaMorphoPositions)
    .filter(({ user }) => blacklisted.has(user))
    .reduce((resultingState, { id, supplyShards, metaMorpho: metamorphoAddress }) => {
      const metamorpho = resultingState.metaMorphos[metamorphoAddress]!;
      metamorpho.totalShards -= supplyShards;

      delete resultingState.metaMorphoPositions[id];

      return resultingState;
    }, blacklistedPositionsState);
};

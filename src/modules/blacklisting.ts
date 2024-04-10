import { ShardsState } from "../stateManager";
import { Address } from "viem";

export const blacklistingAddress = (
  state: ShardsState,
  blacklistedAddresses: Address[] | Address
) => {
  if (!Array.isArray(blacklistedAddresses)) {
    blacklistedAddresses = [blacklistedAddresses];
  }
  const blacklisted = new Set(blacklistedAddresses);
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
      state
    );

  return Object.values(state.metaMorphoPositions)
    .filter(({ user }) => blacklisted.has(user))
    .reduce((resultingState, { id, supplyShards, metaMorpho: metamorphoAddress }) => {
      const metamorpho = resultingState.metaMorphos[metamorphoAddress]!;
      metamorpho.totalShards -= supplyShards;

      delete resultingState.metaMorphoPositions[id];

      return resultingState;
    }, blacklistedPositionsState);
};

import { PointsState } from "../stateManager";
import { Address } from "viem";

export const blacklistingAddress = (
  state: PointsState,
  blacklistedAddresses: Address[] | Address
) => {
  if (!Array.isArray(blacklistedAddresses)) {
    blacklistedAddresses = [blacklistedAddresses];
  }
  const blacklisted = new Set(blacklistedAddresses);
  const blacklistedPositionsState = Object.values(state.positions)
    .filter(({ user }) => blacklisted.has(user))
    .reduce(
      (
        resultingState,
        {
          supplyPoints,
          collateralShards,
          collateralPoints,
          borrowPoints,
          market: marketId,
          borrowShards,
          supplyShards,
          id,
        }
      ) => {
        const market = resultingState.markets[marketId]!;
        market.totalSupplyPoints -= supplyPoints;
        market.totalCollateralShards -= collateralShards;
        market.totalCollateralPoints -= collateralPoints;
        market.totalBorrowPoints -= borrowPoints;
        market.totalBorrowShards -= borrowShards;
        market.totalSupplyShards -= supplyShards;

        delete resultingState.positions[id];

        return resultingState;
      },
      state
    );

  return Object.values(state.metaMorphoPositions)
    .filter(({ user }) => blacklisted.has(user))
    .reduce((resultingState, { id, supplyShards, metaMorpho: metamorphoAddress, supplyPoints }) => {
      const metamorpho = resultingState.metaMorphos[metamorphoAddress]!;
      metamorpho.totalShards -= supplyShards;
      metamorpho.totalPoints -= supplyPoints;

      delete resultingState.metaMorphoPositions[id];

      return resultingState;
    }, blacklistedPositionsState);
};

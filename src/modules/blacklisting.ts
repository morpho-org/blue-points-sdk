import { Address } from "viem";

import { clonePointsState, PointsState } from "../client";

import { Module } from "./index";

export const blacklistingAddress = (
  state: PointsState,
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
      (resultingState, { collateralPoints, market: marketId, borrowPoints, supplyPoints, id }) => {
        const market = resultingState.markets[marketId]!;
        market.totalCollateralPoints -= collateralPoints;
        market.totalBorrowPoints -= borrowPoints;
        market.totalSupplyPoints -= supplyPoints;

        delete resultingState.positions[id];

        return resultingState;
      },
      clonePointsState(state)
    );

  // We then blacklist all the metamorpho positions that belong to the blacklisted addresses
  return Object.values(state.metaMorphoPositions)
    .filter(({ user }) => blacklisted.has(user))
    .reduce((resultingState, { id, supplyPoints, metaMorpho: metamorphoAddress }) => {
      const metamorpho = resultingState.metaMorphos[metamorphoAddress]!;
      metamorpho.totalPoints -= supplyPoints;

      delete resultingState.metaMorphoPositions[id];

      return resultingState;
    }, blacklistedPositionsState);
};

export class BlacklistingModule implements Module {
  constructor(public readonly blackListedAddresses: Address[] | Address) {}

  handle(state: PointsState) {
    return blacklistingAddress(state, this.blackListedAddresses);
  }
}

import { Address, Hex } from "viem";

import { blacklistingAddress, ShardsState, cloneShardsState } from "..";

import { MORPHO_ADDRESS } from "./constants";
import { getMetaMorphoPositionId, initMetaMorphoPointsPosition } from "./metaMorphoDistributor";
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

const redistributeVaultShardsToCollateralUsers = (
  state: ShardsState,
  mmAddress: Address,
  marketId: Hex,
  shardsToRedistribute: bigint
): ShardsState => {
  const market = state.markets[marketId]!;

  if (market.totalCollateralShards === 0n) return state;
  let totalShardsRedistributed = 0n;

  const newState = Object.values(state.positions)
    .filter(({ market, collateralShards }) => market === marketId && collateralShards !== 0n)
    .reduce((resultingState, { user, collateralShards }) => {
      const userVaultShards =
        (shardsToRedistribute * collateralShards) / market.totalCollateralShards;

      const vaultPositionId = getPositionId(marketId, user);
      const userVaultPosition =
        state.metaMorphoPositions[vaultPositionId] ?? initMetaMorphoPointsPosition(mmAddress, user);
      userVaultPosition.supplyShards += userVaultShards;

      totalShardsRedistributed += userVaultShards;

      resultingState.metaMorphoPositions[vaultPositionId] = userVaultPosition;
      return resultingState;
    }, state);

  const mmBluePosition =
    newState.metaMorphoPositions[getMetaMorphoPositionId(mmAddress, MORPHO_ADDRESS)]!;
  mmBluePosition.supplyShards -= totalShardsRedistributed;

  if (mmBluePosition.supplyShards < 0n) {
    throw new Error(`Negative Morpho supply shards or points for metamorpho ${mmAddress}`);
  }

  return newState;
};

const redistributeCollateralPointsToMetaMorphoUsers = (
  state: ShardsState,
  mmAddress: Address
): ShardsState => {
  const vaultBluePosition =
    state.metaMorphoPositions[getMetaMorphoPositionId(mmAddress, MORPHO_ADDRESS)];
  if (!vaultBluePosition) return state;

  //TODO: what if a vault is added as loan asset in a market?
  const totalVaultShardsOnBlue = vaultBluePosition.supplyShards;

  const marketsWithVaultAsCollateral = Object.values(state.markets).filter(
    ({ collateralToken }) => collateralToken === mmAddress
  );
  const allMarketsCollateralShards = marketsWithVaultAsCollateral.reduce(
    (acc, { totalCollateralShards }) => acc + totalCollateralShards,
    0n
  );
  if (allMarketsCollateralShards === 0n) return state;

  return marketsWithVaultAsCollateral.reduce((resultingState, { totalCollateralShards, id }) => {
    const vaultShardsToRedistribute =
      (totalVaultShardsOnBlue * totalCollateralShards) / allMarketsCollateralShards;

    return redistributeVaultShardsToCollateralUsers(
      resultingState,
      mmAddress,
      id,
      vaultShardsToRedistribute
    );
  }, cloneShardsState(state));
};

/** Redistribute the points accrued by Morpho as vault user to the different markets users
 *
 * Map over all vaults that are used as collateral.
 * */
export const redistributeVaultAsCollateral = (state: ShardsState): ShardsState => {
  const vaultAsCollateral = Object.values(state.metaMorphos).filter(({ id }) =>
    Object.values(state.markets).some(
      ({ collateralToken, totalCollateralShards }) =>
        collateralToken === id && totalCollateralShards > 0n
    )
  );

  return vaultAsCollateral.reduce(
    (resultingState, { id }) => redistributeCollateralPointsToMetaMorphoUsers(resultingState, id),
    cloneShardsState(state)
  );
};

/**
 * We first need to redistribute to the users that have used the vault as collateral
 * And then, we spread the vault market points to the vault users.
 * Finally, we blacklist the remaining points of blue (due to roundings during the redistribution)
 */
export const redistributeAll = (state: ShardsState) =>
  blacklistingAddress(redistributeMetaMorpho(redistributeVaultAsCollateral(state)), MORPHO_ADDRESS);

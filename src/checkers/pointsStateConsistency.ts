import { PointsState } from "../stateManager";

export const reduceMarketAndVaultsFromPositions = (_state: PointsState) => {
  let state = Object.assign({}, _state);

  state = Object.values(state.positions).reduce(
    (resultedState, { market: marketId, supplyShards, borrowShards, collateralShards }) => {
      const market = resultedState.markets[marketId]!;

      market.totalSupplyShards -= supplyShards;
      market.totalBorrowShards -= borrowShards;
      market.totalCollateralShards -= collateralShards;

      return resultedState;
    },
    state
  );

  state = Object.values(state.metaMorphoPositions).reduce(
    (resultedState, { metaMorpho: metaMorphoAddress, supplyShards }) => {
      const metaMorpho = resultedState.metaMorphos[metaMorphoAddress]!;

      metaMorpho.totalShards -= supplyShards;

      return resultedState;
    },
    state
  );
  return state;
};

export const checkShardsConsistency = (_state: PointsState) => {
  const state = reduceMarketAndVaultsFromPositions(_state);

  const hasMarketInconsistency = Object.values(state.markets).some(
    ({ totalSupplyShards, totalBorrowShards, totalCollateralShards }) =>
      totalSupplyShards !== 0n || totalBorrowShards !== 0n || totalCollateralShards !== 0n
  );

  const hasMetaMorphoInconsistency = Object.values(state.metaMorphos).some(
    ({ totalShards }) => totalShards !== 0n
  );

  return {
    hasInconsistency: hasMarketInconsistency || hasMetaMorphoInconsistency,
    hasMarketInconsistency,
    hasMetaMorphoInconsistency,
    state,
  };
};

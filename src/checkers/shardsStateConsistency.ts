import { ShardsState } from "../stateManager";

export const reduceMarketAndVaultsFromPositions = (_state: ShardsState) => {
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

export const checkShardsConsistency = (_state: ShardsState) => {
  const state = reduceMarketAndVaultsFromPositions(_state);

  const hasMarketInconsistencies = Object.values(state.markets).some(
    ({ totalSupplyShards, totalBorrowShards, totalCollateralShards }) =>
      totalSupplyShards !== 0n || totalBorrowShards !== 0n || totalCollateralShards !== 0n
  );

  const hasMetaMorphoInconsistencies = Object.values(state.metaMorphos).some(
    ({ totalShards }) => totalShards !== 0n
  );

  return {
    hasInconsistencies: hasMarketInconsistencies || hasMetaMorphoInconsistencies,
    hasMarketInconsistencies,
    hasMetaMorphoInconsistencies,
    state,
  };
};

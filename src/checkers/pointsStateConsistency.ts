import { PointsState } from "../stateManager";

export const reduceMarketAndVaultsFromPositions = (_state: PointsState) => {
  let state = Object.assign({}, _state);

  state = Object.values(state.positions).reduce(
    (
      resultedState,
      {
        market: marketId,
        supplyShards,
        borrowShards,
        borrowPoints,
        collateralPoints,
        collateralShards,
        supplyPoints,
      }
    ) => {
      const market = resultedState.markets[marketId]!;

      market.totalSupplyPoints -= supplyPoints;
      market.totalSupplyShards -= supplyShards;
      market.totalBorrowPoints -= borrowPoints;
      market.totalBorrowShards -= borrowShards;
      market.totalCollateralShards -= collateralShards;
      market.totalCollateralPoints -= collateralPoints;

      return resultedState;
    },
    state
  );

  state = Object.values(state.metaMorphoPositions).reduce(
    (resultedState, { metaMorpho: metaMorphoAddress, supplyPoints, supplyShards }) => {
      const metaMorpho = resultedState.metaMorphos[metaMorphoAddress]!;

      metaMorpho.totalPoints -= supplyPoints;
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

export const checkPointsConsistency = (_state: PointsState, tolerance: bigint) => {
  const state = reduceMarketAndVaultsFromPositions(_state);

  const hasMarketInconsistency = Object.values(state.markets).some(
    ({ totalSupplyPoints, totalBorrowPoints, totalCollateralPoints }) =>
      totalSupplyPoints < 0n ||
      totalBorrowPoints < 0n ||
      totalCollateralPoints < 0n ||
      totalSupplyPoints > tolerance ||
      totalBorrowPoints > tolerance ||
      totalCollateralPoints > tolerance
  );

  const hasMetaMorphoInconsistency = Object.values(state.metaMorphos).some(
    ({ totalShards }) => totalShards < 0n || totalShards > tolerance
  );

  return {
    hasInconsistency: hasMarketInconsistency || hasMetaMorphoInconsistency,
    hasMarketInconsistency,
    hasMetaMorphoInconsistency,
    state,
  };
};

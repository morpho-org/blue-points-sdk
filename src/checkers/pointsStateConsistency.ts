import { clonePointsState, PointsState } from "../stateManager";

export const reduceMarketAndVaultsFromPositions = (_state: PointsState) => {
  let state = clonePointsState(_state);

  state = Object.values(state.positions).reduce(
    (resultedState, { market: marketId, supplyPoints, borrowPoints, collateralPoints }) => {
      const market = resultedState.markets[marketId]!;

      market.totalSupplyPoints -= supplyPoints;
      market.totalBorrowPoints -= borrowPoints;
      market.totalCollateralPoints -= collateralPoints;

      return resultedState;
    },
    state
  );

  state = Object.values(state.metaMorphoPositions).reduce(
    (resultedState, { metaMorpho: metaMorphoAddress, supplyPoints }) => {
      const metaMorpho = resultedState.metaMorphos[metaMorphoAddress]!;

      metaMorpho.totalPoints -= supplyPoints;

      return resultedState;
    },
    state
  );

  return state;
};

export const checkPointsConsistency = (_state: PointsState) => {
  const state = reduceMarketAndVaultsFromPositions(_state);

  const hasMarketInconsistencies = Object.values(state.markets).some(
    ({ totalSupplyPoints, totalBorrowPoints, totalCollateralPoints }) =>
      totalSupplyPoints !== 0n || totalBorrowPoints !== 0n || totalCollateralPoints !== 0n
  );

  const hasMetaMorphoInconsistencies = Object.values(state.metaMorphos).some(
    ({ totalPoints }) => totalPoints !== 0n
  );

  return {
    hasInconsistencies: hasMarketInconsistencies || hasMetaMorphoInconsistencies,
    hasMarketInconsistencies,
    hasMetaMorphoInconsistencies,
    state,
  };
};

import { State } from "../stateManager";
import { PointsState } from "../stateManager";

import { mapValues } from "./utils";

export const stateDiff = (state: PointsState, newState: PointsState): PointsState => {
  const markets = mapValues(newState.markets, (market, id) => {
    const initialState = state.markets[id];
    if (!initialState) {
      return market;
    }
    return {
      ...market,
      totalSupplyPoints: market.totalSupplyPoints - initialState.totalSupplyPoints,
      totalBorrowPoints: market.totalBorrowPoints - initialState.totalBorrowPoints,
      totalCollateralPoints: market.totalCollateralPoints - initialState.totalCollateralPoints,
    };
  });

  const positions = mapValues(newState.positions, (position, id) => {
    const initialState = state.positions[id];
    if (!initialState) {
      return position;
    }
    return {
      ...position,
      supplyPoints: position.supplyPoints - initialState.supplyPoints,
      borrowPoints: position.borrowPoints - initialState.borrowPoints,
      collateralPoints: position.collateralPoints - initialState.collateralPoints,
    };
  });

  const metaMorphos = mapValues(newState.metaMorphos, (metaMorpho, id) => {
    const initialState = state.metaMorphos[id];
    if (!initialState) {
      return metaMorpho;
    }
    return {
      ...metaMorpho,
      totalPoints: metaMorpho.totalPoints - initialState.totalPoints,
    };
  });

  const metaMorphoPositions = mapValues(newState.metaMorphoPositions, (position, id) => {
    const initialState = state.metaMorphoPositions[id];
    if (!initialState) {
      return position;
    }
    return {
      ...position,
      supplyPoints: position.supplyPoints - initialState.supplyPoints,
    };
  });

  return {
    markets,
    positions,
    metaMorphos,
    metaMorphoPositions,
  };
};

export const areStatesEqual = (state: State, newState: State): boolean => {
  return (
    Object.keys(state.markets).length === Object.keys(newState.markets).length &&
    Object.keys(state.positions).length === Object.keys(newState.positions).length &&
    Object.keys(state.metaMorphos).length === Object.keys(newState.metaMorphos).length &&
    Object.keys(state.metaMorphoPositions).length ===
      Object.keys(newState.metaMorphoPositions).length &&
    Object.keys(state.markets).every((id) => {
      const market = state.markets[id]!;
      const newMarket = newState.markets[id];
      if (!newMarket) {
        return false;
      }
      return (
        market.totalSupplyPoints === newMarket.totalSupplyPoints &&
        market.totalBorrowPoints === newMarket.totalBorrowPoints &&
        market.totalCollateralPoints === newMarket.totalCollateralPoints
      );
    }) &&
    Object.keys(state.positions).every((id) => {
      const position = state.positions[id]!;
      const newPosition = newState.positions[id];
      if (!newPosition) {
        return false;
      }
      return (
        position.supplyPoints === newPosition.supplyPoints &&
        position.borrowPoints === newPosition.borrowPoints &&
        position.collateralPoints === newPosition.collateralPoints
      );
    }) &&
    Object.keys(state.metaMorphos).every((id) => {
      const metaMorpho = state.metaMorphos[id]!;
      const newMetaMorpho = newState.metaMorphos[id];
      if (!newMetaMorpho) {
        return false;
      }
      return metaMorpho.totalPoints === newMetaMorpho.totalPoints;
    }) &&
    Object.keys(state.metaMorphoPositions).every((id) => {
      const position = state.metaMorphoPositions[id]!;
      const newPosition = newState.metaMorphoPositions[id];
      if (!newPosition) {
        return false;
      }
      return position.supplyPoints === newPosition.supplyPoints;
    })
  );
};

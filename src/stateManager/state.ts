import {
  Entity,
  EntityId,
  Market,
  MarketPoints,
  MetaMorpho,
  MetaMorphoPosition,
  MetaMorphoPositionPoints,
  MetaMorphoPoints,
  Position,
  PositionPoints,
} from "../types";

type EntityMap<T extends Entity> = Record<EntityId, T>;

export interface State {
  markets: EntityMap<Market>;
  positions: EntityMap<Position>;
  metaMorphos: EntityMap<MetaMorpho>;
  metaMorphoPositions: EntityMap<MetaMorphoPosition>;
}
export interface PointsState {
  markets: EntityMap<MarketPoints>;
  positions: EntityMap<PositionPoints>;
  metaMorphos: EntityMap<MetaMorphoPoints>;
  metaMorphoPositions: EntityMap<MetaMorphoPositionPoints>;
}

export const clonePointsState = (state: PointsState) => {
  return {
    markets: { ...state.markets },
    positions: { ...state.positions },
    metaMorphos: { ...state.metaMorphos },
    metaMorphoPositions: { ...state.metaMorphoPositions },
  };
};

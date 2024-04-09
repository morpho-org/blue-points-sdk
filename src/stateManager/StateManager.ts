import {
  Entity,
  EntityId,
  Market,
  MarketPoints,
  MetaMorpho,
  MetaMorphoPoints,
  MetaMorphoPosition,
  MetaMorphoPositionPoints,
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

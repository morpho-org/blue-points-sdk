import {
  Entity,
  EntityId,
  Market,
  MarketShards,
  MetaMorpho,
  MetaMorphoPosition,
  MetaMorphoPositionShards,
  MetaMorphoShards,
  Position,
  PositionShards,
} from "../types";

type EntityMap<T extends Entity> = Record<EntityId, T>;

export interface State {
  markets: EntityMap<Market>;
  positions: EntityMap<Position>;
  metaMorphos: EntityMap<MetaMorpho>;
  metaMorphoPositions: EntityMap<MetaMorphoPosition>;
}
export interface ShardsState {
  markets: EntityMap<MarketShards>;
  positions: EntityMap<PositionShards>;
  metaMorphos: EntityMap<MetaMorphoShards>;
  metaMorphoPositions: EntityMap<MetaMorphoPositionShards>;
}

export const cloneShardsState = (state: ShardsState) => {
  return {
    markets: { ...state.markets },
    positions: { ...state.positions },
    metaMorphos: { ...state.metaMorphos },
    metaMorphoPositions: { ...state.metaMorphoPositions },
  };
};

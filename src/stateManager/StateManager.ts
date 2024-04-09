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
import { Address, concat, Hex } from "viem";

export interface StateManager {
  dumpState(): Promise<State>;
  // getMarket throws if the market does not exist
  getMarket(marketId: string): Promise<Market>;

  // getPosition throws if the position does not exist
  getPosition(marketId: string, user: Address): Promise<Position>;

  getMetaMorpho(address: string): Promise<MetaMorpho>;

  getMetaMorphoPosition(metaMorpho: string, user: string): Promise<MetaMorphoPosition>;
}

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

export class InMemoryStateManager implements StateManager, State {
  markets: EntityMap<Market> = {};
  positions: EntityMap<Position> = {};
  metaMorphos: EntityMap<MetaMorpho> = {};
  metaMorphoPositions: EntityMap<MetaMorphoPosition> = {};
  constructor(initialState: Partial<State> = {}) {
    Object.assign(this, initialState);
  }

  async dumpState(): Promise<State> {
    return this;
  }

  async getMarket(marketId: Hex): Promise<Market> {
    const market = this.markets[marketId];
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }
    return {
      ...market,
    };
  }

  async getPosition(marketId: Hex, user: Address): Promise<Position> {
    const positionId = concat([marketId, user]).toString();
    const position = this.positions[positionId];
    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }
    return {
      ...position,
    };
  }

  async getMetaMorpho(address: string): Promise<MetaMorpho> {
    const metaMorpho = this.metaMorphos[address];
    if (!metaMorpho) {
      throw new Error(`MetaMorpho ${address} not found`);
    }
    return {
      ...metaMorpho,
    };
  }

  async getMetaMorphoPosition(mmAddress: Address, user: Address): Promise<MetaMorphoPosition> {
    const positionId = concat([mmAddress, user]).toString();
    const position = this.metaMorphoPositions[positionId];
    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }
    return {
      ...position,
    };
  }

  async getMarketPositions(marketId: string): Promise<Position[]> {
    return Object.values(this.positions).filter((p) => p.market === marketId);
  }

  async getPositionsOf(user: Address): Promise<Position[]> {
    return Object.values(this.positions).filter((p) => p.user === user);
  }

  async getMetaMorphoPositions(mm: string): Promise<MetaMorphoPosition[]> {
    return Object.values(this.metaMorphoPositions).filter((p) => p.metaMorpho === mm);
  }

  async getMetaMorphoPositionsOnBlue(metaMorpho: Address): Promise<Position[]> {
    return Object.values(this.positions).filter((p) => p.user === metaMorpho);
  }

  async getAllMetaMorphoPositionsOnBlue(): Promise<MetaMorphoPosition[]> {
    const allMetaMorphos = Object.keys(this.metaMorphos);
    return Object.values(this.metaMorphoPositions).filter((p) =>
      allMetaMorphos.includes(p.metaMorpho)
    );
  }
}

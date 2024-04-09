import { Address, Hex } from "viem";

export enum PositionType {
  SUPPLY,
  BORROW,
  COLLATERAL,
}

export type EntityId = string;

export interface Entity {
  id: EntityId;
}

export interface MarketPoints extends Entity {
  id: Hex;

  loanToken: Address;
  collateralToken: Address;

  totalSupplyShards: bigint;
  totalBorrowShards: bigint;
  totalCollateralShards: bigint;

  totalSupplyPoints: bigint;
  totalBorrowPoints: bigint;
  totalCollateralPoints: bigint;
}

export interface Market extends MarketPoints {
  totalSupplyShares: bigint;
  totalBorrowShares: bigint;
  totalCollateral: bigint;

  supplyPointsIndex: bigint;
  borrowPointsIndex: bigint;
  collateralPointsIndex: bigint;

  lastUpdate: bigint;
}

export interface PositionPoints extends Entity {
  user: Address;
  market: Hex;

  supplyShards: bigint;
  borrowShards: bigint;
  collateralShards: bigint;

  supplyPoints: bigint;
  borrowPoints: bigint;
  collateralPoints: bigint;
}
export interface Position extends PositionPoints {
  supplyShares: bigint;
  borrowShares: bigint;
  collateral: bigint;

  lastUpdate: bigint;

  lastSupplyPointsIndex: bigint;
  lastBorrowPointsIndex: bigint;
  lastCollateralPointsIndex: bigint;
}

export interface MetaMorphoPoints extends Entity {
  id: Address;

  totalShards: bigint;
  totalPoints: bigint;
}
export interface MetaMorpho extends MetaMorphoPoints {
  totalShares: bigint;

  pointsIndex: bigint;

  lastUpdate: bigint;
}

export interface MetaMorphoPositionPoints extends Entity {
  user: Address;
  metaMorpho: Address;

  supplyShards: bigint;
  supplyPoints: bigint;
}
export interface MetaMorphoPosition extends MetaMorphoPositionPoints {
  shares: bigint;

  lastUpdate: bigint;

  lastSupplyPointsIndex: bigint;
}

export interface Tx extends Entity {
  timestamp: bigint;

  txHash: Hex;
  txIndex: bigint;
  logIndex: bigint;
  blockNumber: bigint;
}

export interface MetaMorphoTx extends Tx {
  metaMorpho: Address;
  market: Hex;
  user: Address;

  position: EntityId; // MetaMorphoPosition id;
  shares: bigint;
  timestamp: bigint;
  type: PositionType;
}

export interface MorphoTx extends Tx {
  type: PositionType;
  user: Address;
  market: Address;
  shares: bigint;
}

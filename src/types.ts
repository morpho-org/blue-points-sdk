import { Address as ViemAddress, Hex as ViemHex } from "viem";

// Re export the types from viem in order to not make viem as a peer dependency
export type Address = ViemAddress;
export type Hex = ViemHex;

export enum PositionType {
  SUPPLY,
  BORROW,
  COLLATERAL,
}

export type EntityId = string;

export interface Entity {
  id: EntityId;
}

/**
 * MarketPoints is the points representation of the Market entity.
 * It contains aggregated values that are derivated from the positions.
 */
export interface MarketShards extends Entity {
  /* The ID of the market. This is the same as the onchain id, lowercased. */
  id: Hex;

  /** The total supply shards in the market.
   *
   * __Note__: This should be equal to the sum of all supply shards in the market positions.
   */
  totalSupplyShards: bigint;
  /** The total borrow shards in the market.
   *
   * __Note__: This should be equal to the sum of all borrow shards in the market positions.
   */
  totalBorrowShards: bigint;
  /** The total collateral in the market.
   *
   * __Note__: This should be equal to the sum of all collateral in the market positions.
   */
  totalCollateralShards: bigint;
}

/**
 * Market is the entity that represents a market in the system.
 * It extends the points and add indexes + timestamps, used to compute a market snapshot.
 */
export interface Market extends MarketShards {
  totalSupplyShares: bigint;
  totalBorrowShares: bigint;
  totalCollateral: bigint;

  lastUpdate: bigint;
}

/**
 * PositionPoints is the points representation of the Position entity.
 * It contains all the points & shards of a user position in a given market
 */
export interface PositionShards extends Entity {
  /** The Checksummed address of the user. */
  user: Address;
  /** The ID of the market. This is the same as the onchain id, lowercased. */
  market: Hex;

  /** The total supply shards in the position. */
  supplyShards: bigint;
  /** The total borrow shards in the position. */
  borrowShards: bigint;
  /** The total collateral in the position. */
  collateralShards: bigint;
}

/**
 * Position is the entity that represents a user position in the system.
 * It extends the points and add indexes + timestamps, used to compute a position snapshot.
 */
export interface Position extends PositionShards {
  /** The total supply shares of the position, at the time used to retrieve the state */
  supplyShares: bigint;
  /** The total borrow shares of the position, at the time used to retrieve the state */
  borrowShares: bigint;
  /** The total collateral of the position, at the time used to retrieve the state */
  collateral: bigint;

  /** The last update timestamp of the position. */
  lastUpdate: bigint;
}

/**
 * Tx is the entity that represents a MetaMorpho in the system.
 *
 * It contains aggregated values that are derivated from the vault positions.
 */
export interface MetaMorphoShards extends Entity {
  /** The Checksummed address of the vault. */
  id: Address;

  /** The total supply shards in the vault.
   *
   * __Note__: This should be equal to the sum of all supply shards in the vault positions.
   */
  totalShards: bigint;

  /** The total supply points in the vault.
   *
   * __Note__: This number is computed from indexes, that can lead to rounding errors.
   */
}

/**
 * MetaMorpho is the entity that represents a MetaMorpho in the system.
 *
 * It extends the points and add indexes + timestamps, used to compute a MetaMorpho snapshot.
 */
export interface MetaMorpho extends MetaMorphoShards {
  /** The total shares of the vault, at the time used to retrieve the state */
  totalShares: bigint;

  /** The last update timestamp of the vault. */
  lastUpdate: bigint;
}

/**
 * MetaMorphoPositionPoints is the points representation of the MetaMorphoPosition entity.
 */
export interface MetaMorphoPositionShards extends Entity {
  /** The Checksummed address of the user. */
  user: Address;
  /** The Checksummed address of the vault. */
  metaMorpho: Address;

  /** The total supply shards in the position. */
  supplyShards: bigint;
}

/**
 * MetaMorphoPosition is the entity that represents a user position in the system.
 * It extends the points and add indexes + timestamps, used to compute a position snapshot.
 */
export interface MetaMorphoPosition extends MetaMorphoPositionShards {
  /** The total shares of the position, at the time used to retrieve the state */
  shares: bigint;

  /** The last update timestamp of the position. */
  lastUpdate: bigint;
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

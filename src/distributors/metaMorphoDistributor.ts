import { Address, concat } from "viem";
import { MetaMorpho, MetaMorphoPosition, MetaMorphoPositionShards, MetaMorphoTx } from "../types";
import { State } from "../stateManager";
import { freemmer } from "./utils";

export const initMetaMorpho = (address: Address): MetaMorpho => ({
  id: address,
  totalShares: 0n,
  totalShards: 0n,
  lastUpdate: 0n,
});

export const initMetaMorphoPosition = (
  metaMorphoAddress: Address,
  user: Address
): MetaMorphoPosition => ({
  ...initMetaMorphoPointsPosition(metaMorphoAddress, user),
  shares: 0n,
  lastUpdate: 0n,
});
export const initMetaMorphoPointsPosition = (
  metaMorphoAddress: Address,
  user: Address
): MetaMorphoPositionShards => ({
  id: concat([metaMorphoAddress, user]).toString(),
  metaMorpho: metaMorphoAddress,
  user,
  supplyShards: 0n,
});

export const computeMetaMorphoVaultPoints = (_metaMorpho: MetaMorpho, timestamp: bigint) =>
  freemmer.produce(_metaMorpho, (metaMorpho) => {
    const deltaT = timestamp - metaMorpho.lastUpdate;
    if (deltaT < 0) {
      throw new Error(`MetaMorpho ${_metaMorpho.id} has a future lastUpdate`);
    }
    if (metaMorpho.totalShares > 0n) {
      const shardsEmitted = deltaT * metaMorpho.totalShares;
      metaMorpho.totalShards += shardsEmitted;
    }
    metaMorpho.lastUpdate = timestamp;
  });

export const computeMetaMorphoPositionPoints = (_position: MetaMorphoPosition, timestamp: bigint) =>
  freemmer.produce(_position, (position) => {
    const deltaT = timestamp - position.lastUpdate;
    if (deltaT < 0) {
      throw new Error(`MetaMorphoPosition ${_position.id} has a future lastUpdate`);
    }
    const shardsReceived = deltaT * position.shares;
    position.supplyShards += shardsReceived;
    position.lastUpdate = timestamp;
  });

const handleMetaMorphoTx = (
  state: State,
  { metaMorpho, user, timestamp, shares }: MetaMorphoTx
): State => {
  const metaMorphoEntity = state.metaMorphos[metaMorpho] ?? initMetaMorpho(metaMorpho);

  const metamorphoWithPoints = computeMetaMorphoVaultPoints(metaMorphoEntity, timestamp);
  const positionWithPoints = computeMetaMorphoPositionPoints(
    state.metaMorphoPositions[concat([metaMorpho, user]).toString()] ??
      initMetaMorphoPosition(metaMorpho, user),
    timestamp
  );

  return freemmer.produce(state, (draft) => {
    draft.metaMorphos[metaMorpho] = metamorphoWithPoints;
    draft.metaMorphos[metaMorpho]!.totalShares += shares;

    draft.metaMorphoPositions[positionWithPoints.id] = positionWithPoints;
    draft.metaMorphoPositions[positionWithPoints.id]!.shares += shares;
  });
};

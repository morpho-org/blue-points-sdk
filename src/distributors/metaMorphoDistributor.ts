import { Address, concat } from "viem";

import { State } from "../client";
import { MetaMorpho, MetaMorphoPosition, MetaMorphoPositionPoints, MetaMorphoTx } from "../types";

import { freemmer } from "./utils";

export const initMetaMorpho = (address: Address): MetaMorpho => ({
  id: address,
  totalShares: 0n,
  totalPoints: 0n,
  lastUpdate: 0n,
});

export const getMetaMorphoPositionId = (metaMorphoAddress: Address, user: Address) =>
  concat([metaMorphoAddress, user]).toString();

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
): MetaMorphoPositionPoints => ({
  id: getMetaMorphoPositionId(metaMorphoAddress, user),
  metaMorpho: metaMorphoAddress,
  user,
  supplyPoints: 0n,
});

export const computeMetaMorphoVaultPoints = (_metaMorpho: MetaMorpho, timestamp: bigint) =>
  freemmer.produce(_metaMorpho, (metaMorpho) => {
    const deltaT = timestamp - metaMorpho.lastUpdate;
    if (deltaT < 0) {
      throw new Error(`MetaMorpho ${_metaMorpho.id} has a future lastUpdate`);
    }
    if (metaMorpho.totalShares > 0n) {
      const pointsEmitted = deltaT * metaMorpho.totalShares;
      metaMorpho.totalPoints += pointsEmitted;
    }
    metaMorpho.lastUpdate = timestamp;
  });

export const computeMetaMorphoPositionPoints = (_position: MetaMorphoPosition, timestamp: bigint) =>
  freemmer.produce(_position, (position) => {
    const deltaT = timestamp - position.lastUpdate;
    if (deltaT < 0) {
      throw new Error(`MetaMorphoPosition ${_position.id} has a future lastUpdate`);
    }
    const pointsReceived = deltaT * position.shares;
    position.supplyPoints += pointsReceived;
    position.lastUpdate = timestamp;
  });

const handleMetaMorphoTx = (
  state: State,
  { metaMorpho, user, timestamp, shares }: MetaMorphoTx
): State => {
  const metaMorphoEntity = state.metaMorphos[metaMorpho] ?? initMetaMorpho(metaMorpho);

  const metamorphoWithPoints = computeMetaMorphoVaultPoints(metaMorphoEntity, timestamp);
  const positionWithPoints = computeMetaMorphoPositionPoints(
    state.metaMorphoPositions[getMetaMorphoPositionId(metaMorpho, user)] ??
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

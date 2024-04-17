import { Address, concat } from "viem";

import { State } from "../client";
import { MetaMorpho, MetaMorphoPosition, MetaMorphoPositionPoints, MetaMorphoTx } from "../types";

export const initMetaMorpho = (address: Address): MetaMorpho => ({
  id: address,
  totalShares: 0n,
  totalPoints: 0n,
  lastUpdate: 0n,
});

export const getMetaMorphoPositionId = (metaMorphoAddress: Address, user: Address) =>
  concat([metaMorphoAddress, user]).toString().toLowerCase();

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

export const computeMetaMorphoVaultPoints = (_metaMorpho: MetaMorpho, timestamp: bigint) => {
  const metaMorpho = { ..._metaMorpho };
  const deltaT = timestamp - metaMorpho.lastUpdate;
  if (deltaT < 0) {
    throw new Error(`MetaMorpho ${_metaMorpho.id} has a future lastUpdate`);
  }
  if (metaMorpho.totalShares > 0n) {
    const pointsEmitted = deltaT * metaMorpho.totalShares;
    metaMorpho.totalPoints += pointsEmitted;
  }
  metaMorpho.lastUpdate = timestamp;

  return metaMorpho;
};

export const computeMetaMorphoPositionPoints = (
  _position: MetaMorphoPosition,
  timestamp: bigint
) => {
  const position = { ..._position };
  const deltaT = timestamp - position.lastUpdate;
  if (deltaT < 0) {
    throw new Error(`MetaMorphoPosition ${_position.id} has a future lastUpdate`);
  }
  const pointsReceived = deltaT * position.shares;
  position.supplyPoints += pointsReceived;
  position.lastUpdate = timestamp;

  return position;
};

export const handleMetaMorphoTx = (
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
  const modifiedState = {
    ...state,
    metaMorphos: { ...state.metaMorphos },
    metaMorphoPositions: { ...state.metaMorphoPositions },
  };

  modifiedState.metaMorphos[metaMorpho] = {
    ...metamorphoWithPoints,
    totalShares: metamorphoWithPoints.totalShares + shares,
  };

  modifiedState.metaMorphoPositions[positionWithPoints.id] = {
    ...positionWithPoints,
    shares: positionWithPoints.shares + shares,
  };

  return modifiedState;
};

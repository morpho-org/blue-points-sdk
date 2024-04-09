import { Address, concat } from "viem";
import { MetaMorpho, MetaMorphoPosition, MetaMorphoPositionPoints, MetaMorphoTx } from "../types";
import { State } from "../stateManager";
import { POINTS_RATE_PER_SECONDS, PRECISION } from "./constants";
import { freemmer } from "./utils";

export const initMetaMorpho = (address: Address): MetaMorpho => ({
  id: address,
  totalShares: 0n,
  totalShards: 0n,
  totalPoints: 0n,
  pointsIndex: 0n,
  lastUpdate: 0n,
});

export const initMetaMorphoPosition = (
  metaMorphoAddress: Address,
  user: Address
): MetaMorphoPosition => ({
  ...initMetaMorphoPointsPosition(metaMorphoAddress, user),
  shares: 0n,
  lastSupplyPointsIndex: 0n,
  lastUpdate: 0n,
});
export const initMetaMorphoPointsPosition = (
  metaMorphoAddress: Address,
  user: Address
): MetaMorphoPositionPoints => ({
  id: concat([metaMorphoAddress, user]).toString(),
  metaMorpho: metaMorphoAddress,
  user,
  supplyPoints: 0n,
  supplyShards: 0n,
});

export const computeMetaMorphoVaultPoints = (_metaMorpho: MetaMorpho, timestamp: bigint) =>
  freemmer.produce(_metaMorpho, (metaMorpho) => {
    const deltaT = timestamp - metaMorpho.lastUpdate;
    if (deltaT < 0) {
      throw new Error(`MetaMorpho ${_metaMorpho.id} has a future lastUpdate`);
    }
    if (metaMorpho.totalShares > 0n) {
      const pointEmitted = deltaT * POINTS_RATE_PER_SECONDS;
      metaMorpho.totalPoints += pointEmitted;
      metaMorpho.pointsIndex += (pointEmitted * PRECISION) / metaMorpho.totalShares;

      const shardsEmitted = deltaT * metaMorpho.totalShares;
      metaMorpho.totalShards += shardsEmitted;
    }
    metaMorpho.lastUpdate = timestamp;
  });

export const computeMetaMorphoPositionPoints = (
  metaMorpho: MetaMorpho,
  _position: MetaMorphoPosition,
  timestamp: bigint
) =>
  freemmer.produce(_position, (position) => {
    const deltaT = timestamp - position.lastUpdate;
    if (deltaT < 0) {
      throw new Error(`MetaMorphoPosition ${_position.id} has a future lastUpdate`);
    }
    const shardsReceived = deltaT * position.shares;
    position.supplyShards += shardsReceived;

    const pointsReceived =
      ((metaMorpho.pointsIndex - position.lastSupplyPointsIndex) * position.shares) / PRECISION;

    position.supplyPoints += pointsReceived;
    position.lastSupplyPointsIndex = metaMorpho.pointsIndex;
  });

const handleMetaMorphoTx = (
  state: State,
  { metaMorpho, user, timestamp, shares }: MetaMorphoTx
): State => {
  const metaMorphoEntity = state.metaMorphos[metaMorpho] ?? initMetaMorpho(metaMorpho);

  const metamorphoWithPoints = computeMetaMorphoVaultPoints(metaMorphoEntity, timestamp);
  const positionWithPoints = computeMetaMorphoPositionPoints(
    metamorphoWithPoints,
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

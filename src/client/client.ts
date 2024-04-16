import { Address, Hex } from "viem";

import {
  getTimeframeFromSubgraph,
  loadFullFromSubgraphs,
  SnapshotConfig,
  SubgraphConfigs,
} from "../loaders";
import { Module } from "../modules";

import { PointsState } from "./state";

export default class PointsClient {
  readonly state: PointsState;
  static async loadFullFromSubgraph(
    subgraphs: SubgraphConfigs,
    block: number,
    modules: Module[] = []
  ): Promise<PointsClient> {
    const state = await loadFullFromSubgraphs(subgraphs, block);
    return new PointsClient(state, modules);
  }

  static async getTimeframeFromSubgraph(
    subgraphs: SubgraphConfigs,
    from: SnapshotConfig,
    to: SnapshotConfig,
    modules: Module[] = []
  ): Promise<PointsClient> {
    const state = await getTimeframeFromSubgraph({ subgraphs, from, to });
    return new PointsClient(state, modules);
  }
  constructor(
    public readonly initialState: PointsState,
    public readonly modules: Module[] = []
  ) {
    this.state = modules.reduce((state, module) => module.handle(state), initialState);
  }

  getTotalMarketPoints(hexId: Hex) {
    const market = this.state.markets[hexId];

    if (!market) throw new Error("Market not found");

    return {
      totalBorrowPoints: market.totalBorrowPoints,
      totalCollateralPoints: market.totalCollateralPoints,
      totalSupplyPoints: market.totalSupplyPoints,
    };
  }

  getAllUserMarketsPoints(user: Address) {
    const positions = Object.values(this.state.positions).filter((p) => p.user === user);

    return positions.map((position) => this.getUserMarketPoints(position.user, position.market));
  }

  getUserMarketPoints(user: Address, hexId: Hex) {
    const position = Object.values(this.state.positions).find(
      (p) => p.user === user && p.market === hexId
    );

    if (!position) throw new Error("Position not found");

    const market = this.state.markets[position.market]!;

    return {
      borrowPoints: position.borrowPoints,
      collateralPoints: position.collateralPoints,
      supplyPoints: position.supplyPoints,
      market: {
        totalBorrowPoints: market.totalBorrowPoints,
        totalCollateralPoints: market.totalCollateralPoints,
        totalSupplyPoints: market.totalSupplyPoints,
      },
    };
  }

  getMetaMorphoPoints(metaMorpho: Address) {
    const morpho = this.state.metaMorphos[metaMorpho];

    if (!morpho) throw new Error("MetaMorpho not found");

    return {
      totalPoints: morpho.totalPoints,
    };
  }

  getAllUserMetaMorphoPoints(user: Address) {
    const positions = Object.values(this.state.metaMorphoPositions).filter((p) => p.user === user);

    return positions.map((position) => this.getUserMetaMorphoPoints(position.user));
  }

  getUserMetaMorphoPoints(user: Address) {
    const position = Object.values(this.state.metaMorphoPositions).find((p) => p.user === user);

    if (!position) throw new Error("Position not found");

    return {
      supplyPoints: position.supplyPoints,
      metaMorpho: this.getMetaMorphoPoints(position.metaMorpho),
    };
  }

  getAllUserPoints(user: Address) {
    return {
      markets: this.getAllUserMarketsPoints(user),
      metaMorphos: this.getAllUserMetaMorphoPoints(user),
    };
  }
}

import { PointsState } from "../client";

export * from "./blacklisting";

export interface Module {
  handle: (state: PointsState) => PointsState;
}

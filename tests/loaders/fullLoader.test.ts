import * as sinon from "sinon";
import { getAddress } from "viem";

import { SubgraphError } from "../../lib/subgraph";
import {
  fullLoaderQuery,
  loadFullFromSubgraph,
  parseSubgraphData,
  resetCache,
  setConfig,
} from "../../src";
import * as config from "../../src";

import { parsedState, state } from "./mocks";

describe("Full loader", () => {
  setConfig({
    cacheEnabled: false,
  });
  let fetchStub: sinon.SinonStub;
  const subgraphUrl = "https://subgraph.url";

  beforeEach(() => {
    fetchStub = sinon.stub(global, "fetch");
  });

  afterEach(() => {
    fetchStub.restore();
  });

  test("should be able to fetch the subgraph multiple times without pagination", async () => {
    fetchStub.callsFake(async (url, options) => {
      switch (url) {
        case subgraphUrl:
          return new Response(JSON.stringify(state), { status: 200 });

        default:
          return new Response(JSON.stringify({ errors: [{ message: "Error" }] }), { status: 500 });
      }
    });
    const fullLoadedState = await loadFullFromSubgraph(
      {
        url: subgraphUrl,
      },
      1
    );
    expect(fetchStub.calledOnce).toBeTruthy();
    const call = fetchStub.getCall(0);
    expect(fetchStub.calledWith(subgraphUrl)).toBeTruthy();
    expect(fullLoadedState).toStrictEqual(parsedState);
    expect(call.lastArg.method).toBe("POST");
    const body = JSON.parse(call.lastArg.body);
    expect(body.query).toBeDefined();
    expect(body.query).toBe(fullLoaderQuery);
    expect(body.variables).toBeDefined();
    expect(body.variables).toStrictEqual({
      block: 1,
      first: 1000,
      lastMarketsId: "",
      lastPositionsId: "",
      lastMetaMorphosId: "",
      lastMetaMorphoPositionsId: "",
    });
  });

  it("should be able to fetch the subgraph multiple times with pagination", async () => {
    fetchStub.callsFake(async (url, options) => {
      let paginatedState: object = {};
      if (fetchStub!.callCount > 2)
        paginatedState = {
          data: {
            markets: [],
            positions: [],
            metaMorphos: [],
            metaMorphoPositions: [],
          },
        };
      else
        paginatedState = {
          data: {
            markets: [state.data.markets[fetchStub.callCount - 1]],
            positions: [state.data.positions[fetchStub.callCount - 1]],
            metaMorphos: [state.data.metaMorphos[fetchStub.callCount - 1]],
            metaMorphoPositions: [state.data.metaMorphoPositions[fetchStub.callCount - 1]],
          },
        };
      switch (url) {
        case subgraphUrl:
          return new Response(JSON.stringify(paginatedState), { status: 200 });

        default:
          return new Response(JSON.stringify({ errors: [{ message: "Error" }] }), { status: 500 });
      }
    });
    const fullLoadedState = await loadFullFromSubgraph(
      {
        url: subgraphUrl,
        querySize: 1,
      },
      1
    );
    expect(fetchStub.callCount).toEqual(3);
    const call = fetchStub.getCall(0);
    expect(fetchStub.calledWith(subgraphUrl)).toBeTruthy();
    expect(fullLoadedState).toStrictEqual(parsedState);
    expect(call.lastArg.method).toBe("POST");
    const body = JSON.parse(call.lastArg.body);
    expect(body.query).toBeDefined();
    expect(body.query).toBe(fullLoaderQuery);
    expect(body.variables).toBeDefined();
    expect(body.variables).toStrictEqual({
      block: 1,
      first: 1,
      lastMarketsId: "",
      lastPositionsId: "",
      lastMetaMorphosId: "",
      lastMetaMorphoPositionsId: "",
    });

    const secondCall = fetchStub.getCall(1);
    const secondBody = JSON.parse(secondCall.lastArg.body);
    expect(secondBody.query).toBeDefined();
    expect(secondBody.query).toBe(fullLoaderQuery);
    expect(secondBody.variables).toBeDefined();
    expect(secondBody.variables).toStrictEqual({
      block: 1,
      first: 1,
      lastMarketsId: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      lastPositionsId: "0x001247d9f0266722b139959d74c086ac1b038f413c740d71dc89e112c62c7e83",
      lastMetaMorphosId: "0x186514400e52270cef3D80e1c6F8d10A75d47344",
      lastMetaMorphoPositionsId:
        "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11",
    });

    const thirdCall = fetchStub.getCall(2);
    const thirdBody = JSON.parse(thirdCall.lastArg.body);
    expect(thirdBody.query).toBeDefined();
    expect(thirdBody.query).toBe(fullLoaderQuery);
    expect(thirdBody.variables).toBeDefined();
    expect(thirdBody.variables).toStrictEqual({
      block: 1,
      first: 1,
      lastMarketsId: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      lastPositionsId: "0x0045d9a5398203ffc24fea13c1814b628a36c65b805f1587bbf70f269385f0c2",
      lastMetaMorphosId: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345"),
      lastMetaMorphoPositionsId:
        "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c",
    });
  });

  it("should parse correctly the graph result", () => {
    expect(parseSubgraphData(state.data)).toStrictEqual({
      markets: Object.values(parsedState.markets),
      positions: Object.values(parsedState.positions),
      metaMorphos: Object.values(parsedState.metaMorphos),
      metaMorphoPositions: Object.values(parsedState.metaMorphoPositions),
    });
  });

  it("should use cache for the same block fetch called twice", async () => {
    fetchStub.callsFake(async (url, options) => {
      switch (url) {
        case subgraphUrl:
          return new Response(JSON.stringify(state), { status: 200 });

        default:
          return new Response(JSON.stringify({ errors: [{ message: "Error" }] }), { status: 500 });
      }
    });

    const getConfigStub = sinon.stub(config, "getConfig");
    getConfigStub.returns({
      cacheEnabled: true,
    });

    await loadFullFromSubgraph(
      {
        url: subgraphUrl,
      },
      1
    );
    expect(fetchStub.calledOnce).toBeTruthy();
    await loadFullFromSubgraph(
      {
        url: subgraphUrl,
      },
      1
    );
    expect(fetchStub.calledOnce).toBeTruthy();
    getConfigStub.restore();
    resetCache();
  });

  it("should not use cache for 2 different block fetches", async () => {
    fetchStub.callsFake(async (url, options) => {
      switch (url) {
        case subgraphUrl:
          return new Response(JSON.stringify(state), { status: 200 });

        default:
          return new Response(JSON.stringify({ errors: [{ message: "Error" }] }), { status: 500 });
      }
    });

    const getConfigStub = sinon.stub(config, "getConfig");
    getConfigStub.returns({
      cacheEnabled: true,
    });

    await loadFullFromSubgraph(
      {
        url: subgraphUrl,
      },
      1
    );
    expect(fetchStub.calledOnce).toBeTruthy();
    await loadFullFromSubgraph(
      {
        url: subgraphUrl,
      },
      2
    );
    expect(fetchStub.calledTwice).toBeTruthy();
    getConfigStub.restore();
    resetCache();
  });
  it("should retry & throw if there is an error", async () => {
    fetchStub.callsFake(
      async (url, options) =>
        new Response(JSON.stringify({ errors: [{ message: "Error", location: [] }] }), {
          status: 200,
        })
    );

    await expect(
      loadFullFromSubgraph(
        {
          url: subgraphUrl,
          maxRetries: 2,
        },
        1
      )
    ).rejects.toEqual(new SubgraphError([{ message: "Error", location: [] }]));

    expect(fetchStub.calledThrice).toBeTruthy();
  });
});

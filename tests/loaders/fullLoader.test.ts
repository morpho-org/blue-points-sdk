import * as sinon from "sinon";
import { getAddress } from "viem";

import {
  fullLoaderQuery,
  loadFullFromSubgraph,
  parseSubgraphData,
  resetCache,
  setConfig,
} from "../../src";
import * as config from "../../src";

describe("Full loader", () => {
  setConfig({
    cacheEnabled: false,
  });
  let fetchStub: sinon.SinonStub;
  const subgraphUrl = "https://subgraph.url";
  const state = {
    data: {
      markets: [
        {
          id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
          loanToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
          collateralToken: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
          totalSupplyShares: "1000000000000000000000000",
          totalBorrowShares: "900000000000000000000000",
          totalCollateral: "10000",
          totalSupplyShards: "36000000000000000000000000",
          totalBorrowShards: "0",
          totalCollateralShards: "19680000",
          lastUpdate: "1712113403",
        },
        {
          id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
          loanToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          collateralToken: "0x83f20f44975d03b1b09e64809b757c47f942beea",
          totalSupplyShares: "500000000000",
          totalBorrowShares: "900246302003",
          totalCollateral: "4000000000000000000",
          totalSupplyShards: "4418888682513304103796",
          totalBorrowShards: "6752792770884622644300",
          totalCollateralShards: "6770271578745516586530722520",
          lastUpdate: "1712049443",
        },
      ],
      positions: [
        {
          id: "0x001247d9f0266722b139959d74c086ac1b038f413c740d71dc89e112c62c7e83",
          user: {
            id: "0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327",
          },
          market: {
            id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
          },
          supplyShares: "0",
          borrowShares: "0",
          collateral: "0",
          supplyShards: "0",
          borrowShards: "6304686594341171851252854600",
          collateralShards: "2464285725637273525921295808",
          lastUpdate: "1712671931",
        },
        {
          id: "0x0045d9a5398203ffc24fea13c1814b628a36c65b805f1587bbf70f269385f0c2",
          user: {
            id: "0xebfa750279defa89b8d99bdd145a016f6292757b",
          },
          market: {
            id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
          },
          supplyShares: "108739465364687797",
          borrowShares: "0",
          collateral: "0",
          supplyShards: "85922809433476617893472",
          borrowShards: "0",
          collateralShards: "0",
          lastUpdate: "1712626379",
        },
      ],
      metaMorphos: [
        {
          id: "0x186514400e52270cef3d80e1c6f8d10a75d47344",
          totalShares: "3788388601456103634055160",
          totalShards: "34039944574599186112836081238548",
          lastUpdate: "1712836667",
        },
        {
          id: "0x186514400e52270cef3d80e1c6f8d10a75d47345",
          totalShares: "3788388601456103634055160",
          totalShards: "34039944574599186112836081238548",
          lastUpdate: "1712836667",
        },
      ],
      metaMorphoPositions: [
        {
          id: "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11",
          metaMorpho: {
            id: "0x186514400e52270cef3d80e1c6f8d10a75d47344",
          },
          user: {
            id: "0x77155b7d373f2b22b5944b7434ba285c5fcefea9",
          },
          shares: "12666472865775207373",
          supplyShards: "2185942811223110625091008",
          lastUpdate: "1712554427",
        },
        {
          id: "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c",
          metaMorpho: {
            id: "0x186514400e52270cef3d80e1c6f8d10a75d47344",
          },
          user: {
            id: "0x408e986a277da059a90c4be5051f67c6e3fd5cff",
          },
          shares: "1499992396913558344",
          supplyShards: "0",
          lastUpdate: "1706882015",
        },
      ],
    },
  };
  const parsedState = {
    markets: {
      "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b": {
        id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        loanToken: getAddress("0x6b175474e89094c44da98b954eedeac495271d0f"),
        collateralToken: getAddress("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"),
        totalSupplyShares: 1000000000000000000000000n,
        totalBorrowShares: 900000000000000000000000n,
        totalCollateral: 10000n,
        totalSupplyShards: 36000000000000000000000000n,
        totalBorrowShards: 0n,
        totalCollateralShards: 19680000n,
        lastUpdate: 1712113403n,
      },
      "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1": {
        id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
        loanToken: getAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
        collateralToken: getAddress("0x83f20f44975d03b1b09e64809b757c47f942beea"),
        totalSupplyShares: 500000000000n,
        totalBorrowShares: 900246302003n,
        totalCollateral: 4000000000000000000n,
        totalSupplyShards: 4418888682513304103796n,
        totalBorrowShards: 6752792770884622644300n,
        totalCollateralShards: 6770271578745516586530722520n,
        lastUpdate: 1712049443n,
      },
    },

    positions: {
      "0x001247d9f0266722b139959d74c086ac1b038f413c740d71dc89e112c62c7e83": {
        id: "0x001247d9f0266722b139959d74c086ac1b038f413c740d71dc89e112c62c7e83",
        user: getAddress("0x51382c7e0ff4dd26683b3356f4fd1320f9cf3327"),
        market: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        supplyShares: 0n,
        borrowShares: 0n,
        collateral: 0n,
        supplyShards: 0n,
        borrowShards: 6304686594341171851252854600n,
        collateralShards: 2464285725637273525921295808n,
        lastUpdate: 1712671931n,
      },
      "0x0045d9a5398203ffc24fea13c1814b628a36c65b805f1587bbf70f269385f0c2": {
        id: "0x0045d9a5398203ffc24fea13c1814b628a36c65b805f1587bbf70f269385f0c2",
        user: getAddress("0xebfa750279defa89b8d99bdd145a016f6292757b"),
        market: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
        supplyShares: 108739465364687797n,
        borrowShares: 0n,
        collateral: 0n,
        supplyShards: 85922809433476617893472n,
        borrowShards: 0n,
        collateralShards: 0n,
        lastUpdate: 1712626379n,
      },
    },

    metaMorphos: {
      [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344")]: {
        id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
        totalShares: 3788388601456103634055160n,
        totalShards: 34039944574599186112836081238548n,
        lastUpdate: 1712836667n,
      },
      [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345")]: {
        id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345"),
        totalShares: 3788388601456103634055160n,
        totalShards: 34039944574599186112836081238548n,
        lastUpdate: 1712836667n,
      },
    },
    metaMorphoPositions: {
      "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11": {
        id: "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11",
        metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
        user: getAddress("0x77155b7d373f2b22b5944b7434ba285c5fcefea9"),
        shares: 12666472865775207373n,
        supplyShards: 2185942811223110625091008n,
        lastUpdate: 1712554427n,
      },
      "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c": {
        id: "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c",
        metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
        user: getAddress("0x408e986a277da059a90c4be5051f67c6e3fd5cff"),
        shares: 1499992396913558344n,
        supplyShards: 0n,
        lastUpdate: 1706882015n,
      },
    },
  };
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
});

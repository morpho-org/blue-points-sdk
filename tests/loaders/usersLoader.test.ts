import * as sinon from "sinon";

import { loadFromOneSubgraph, setConfig } from "../../src";
import { loadFullForUsers, usersLoaderQuery } from "../../src/loaders/usersLoader";

import twoUsersQueryResp from "./mocks/twoUserLoader.query.json";
import userQueryResp from "./mocks/userLoader.query.json";

const oneUserParsedState = {
  markets: {
    ["0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d"]: {
      id: "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d",
      totalSupplyShares: 847523997333266240161647613n,
      totalBorrowShares: 835039442034336468036684461n,
      totalCollateral: 804918832967901895768n,
      totalSupplyPoints: 784386767607274814102064651322836n,
      totalBorrowPoints: 1455577997307805864061602580256n,
      totalCollateralPoints: 1389283259536479517997952n,
      lastUpdate: 1713344903n,
    },
    ["0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c"]: {
      id: "0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c",
      totalSupplyShares: 49657672841723338769814524513360n,
      totalBorrowShares: 45093786853782944878489276993953n,
      totalCollateral: 56361291730760666721198258n,
      totalSupplyPoints: 60125326008685853058236497913484166896n,
      totalBorrowPoints: 56207613115812751632571954832922013128n,
      totalCollateralPoints: 75535643349382999294677224183160n,
      lastUpdate: 1713394799n,
    },
    ["0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28"]: {
      id: "0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28",
      totalSupplyShares: 29925376355134210457760153400100n,
      totalBorrowShares: 24711968419196911861420114591078n,
      totalCollateral: 33891359343293608166914095n,
      totalSupplyPoints: 51166886179209982255844710155985180548n,
      totalBorrowPoints: 45745650447160160791154021752055149332n,
      totalCollateralPoints: 75911777178036009061915043233632n,
      lastUpdate: 1713411395n,
    },
  },
  positions: {
    ["0x4a6b77c938d3f9d4ae4f4a498692794ed75eb492267d7a9b53107824e887a509"]: {
      id: "0x4a6b77c938d3f9d4ae4f4a498692794ed75eb492267d7a9b53107824e887a509",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      market: "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d",
      supplyShares: 0n,
      borrowShares: 829885076980693889618425627n,
      collateral: 800000000000000000000n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1713344903n,
    },
    ["0x959716c78b9a090840d8a2461e3560c93b54f8f99dffbce569762f09f1c426cc"]: {
      id: "0x959716c78b9a090840d8a2461e3560c93b54f8f99dffbce569762f09f1c426cc",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      market: "0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c",
      supplyShares: 498394106602675456004428059994n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1711385399n,
    },
    ["0xc0182cd6fc95e0943ffe3fbb84fff33fd3e0268083517abde688101777226f48"]: {
      id: "0xc0182cd6fc95e0943ffe3fbb84fff33fd3e0268083517abde688101777226f48",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      market: "0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28",
      supplyShares: 498436553829331553507779050320n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1711385399n,
    },
  },
  metaMorphos: {
    ["0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB"]: {
      id: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
      totalShares: 36000073272527556882899934n,
      totalPoints: 150638406476208413823624784157856n,
      lastUpdate: 1713421571n,
    },
    ["0x38989BBA00BDF8181F4082995b3DEAe96163aC5D"]: {
      id: "0x38989BBA00BDF8181F4082995b3DEAe96163aC5D",
      totalShares: 11147158767033518156131n,
      totalPoints: 84685508194929118375296582864n,
      lastUpdate: 1713399275n,
    },
    ["0xdd0f28e19C1780eb6396170735D45153D261490d"]: {
      id: "0xdd0f28e19C1780eb6396170735D45153D261490d",
      totalShares: 7836796779420095518474917n,
      totalPoints: 14161935483328970960766263400648n,
      lastUpdate: 1713339491n,
    },
    ["0x95EeF579155cd2C5510F312c8fA39208c3Be01a8"]: {
      id: "0x95EeF579155cd2C5510F312c8fA39208c3Be01a8",
      totalShares: 4441256634343308013795146n,
      totalPoints: 5404233607301144379055499950356n,
      lastUpdate: 1713414035n,
    },
  },
  metaMorphoPositions: {
    ["0x135ed163b972a21d06bc2d6a2ecffb9e0970c845a4b163f6a7ffb062f6a66e04"]: {
      id: "0x135ed163b972a21d06bc2d6a2ecffb9e0970c845a4b163f6a7ffb062f6a66e04",
      metaMorpho: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 337810840628184125856652n,
      supplyPoints: 4697649292479389987214909641520n,
      lastUpdate: 1712058335n,
    },
    ["0x772f6eb353634a2137fdfa01023102a43056a769c9f92bad8964fdfbcfd024c4"]: {
      id: "0x772f6eb353634a2137fdfa01023102a43056a769c9f92bad8964fdfbcfd024c4",
      metaMorpho: "0x38989BBA00BDF8181F4082995b3DEAe96163aC5D",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 221564678847136211727n,
      supplyPoints: 0n,
      lastUpdate: 1704825575n,
    },
    ["0xd3c0baf52e4ab511c935f232c826d4e3d97f342df17aae2a27a77c5a1166f9dd"]: {
      id: "0xd3c0baf52e4ab511c935f232c826d4e3d97f342df17aae2a27a77c5a1166f9dd",
      metaMorpho: "0xdd0f28e19C1780eb6396170735D45153D261490d",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 385023822484733137169743n,
      supplyPoints: 0n,
      lastUpdate: 1710339791n,
    },
    ["0xd58dd7ddfb0e74ceda438fb9e4734d08ca67331bec658980bcb5bb4f6a499c16"]: {
      id: "0xd58dd7ddfb0e74ceda438fb9e4734d08ca67331bec658980bcb5bb4f6a499c16",
      metaMorpho: "0x95EeF579155cd2C5510F312c8fA39208c3Be01a8",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 345359661696544378268773n,
      supplyPoints: 0n,
      lastUpdate: 1712058863n,
    },
  },
};

const twoUsersParsedState = {
  markets: {
    "0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc": {
      id: "0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc",
      totalSupplyShares: 34853011885835356465n,
      totalBorrowShares: 27684149743609439377n,
      totalCollateral: 15473519035626294748792n,
      totalSupplyPoints: 172430943212628686890777452n,
      totalBorrowPoints: 140181643532977861469285988n,
      totalCollateralPoints: 62815212992171027343196955340n,
      lastUpdate: 1713421823n,
    },
    "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d": {
      id: "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d",
      totalSupplyShares: 847523997333266240161647613n,
      totalBorrowShares: 835039442034336468036684461n,
      totalCollateral: 804918832967901895768n,
      totalSupplyPoints: 784386767607274814102064651322836n,
      totalBorrowPoints: 1455577997307805864061602580256n,
      totalCollateralPoints: 1389283259536479517997952n,
      lastUpdate: 1713344903n,
    },
    "0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c": {
      id: "0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c",
      totalSupplyShares: 49657672841723338769814524513360n,
      totalBorrowShares: 45093786853782944878489276993953n,
      totalCollateral: 56361291730760666721198258n,
      totalSupplyPoints: 60125326008685853058236497913484166896n,
      totalBorrowPoints: 56207613115812751632571954832922013128n,
      totalCollateralPoints: 75535643349382999294677224183160n,
      lastUpdate: 1713394799n,
    },
    "0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28": {
      id: "0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28",
      totalSupplyShares: 29925376355134210457760153400100n,
      totalBorrowShares: 24711968419196911861420114591078n,
      totalCollateral: 33891359343293608166914095n,
      totalSupplyPoints: 51166886179209982255844710155985180548n,
      totalBorrowPoints: 45745650447160160791154021752055149332n,
      totalCollateralPoints: 75911777178036009061915043233632n,
      lastUpdate: 1713411395n,
    },
  },
  positions: {
    "0x4009fa1d36c3819fc95212aa780b0c2afc69b9f0f4b76aa82141e2cd96105bea": {
      id: "0x4009fa1d36c3819fc95212aa780b0c2afc69b9f0f4b76aa82141e2cd96105bea",
      user: "0xf2e018258a20a046Df85194e93db566A492DB1EB",
      market: "0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc",
      supplyShares: 0n,
      borrowShares: 1999714001230n,
      collateral: 8600000000000000n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1704745547n,
    },
    "0x4a6b77c938d3f9d4ae4f4a498692794ed75eb492267d7a9b53107824e887a509": {
      id: "0x4a6b77c938d3f9d4ae4f4a498692794ed75eb492267d7a9b53107824e887a509",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      market: "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d",
      supplyShares: 0n,
      borrowShares: 829885076980693889618425627n,
      collateral: 800000000000000000000n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1713344903n,
    },
    "0x959716c78b9a090840d8a2461e3560c93b54f8f99dffbce569762f09f1c426cc": {
      id: "0x959716c78b9a090840d8a2461e3560c93b54f8f99dffbce569762f09f1c426cc",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      market: "0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c",
      supplyShares: 498394106602675456004428059994n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1711385399n,
    },
    "0xc0182cd6fc95e0943ffe3fbb84fff33fd3e0268083517abde688101777226f48": {
      id: "0xc0182cd6fc95e0943ffe3fbb84fff33fd3e0268083517abde688101777226f48",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      market: "0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28",
      supplyShares: 498436553829331553507779050320n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 0n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1711385399n,
    },
  },
  metaMorphos: {
    "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB": {
      id: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
      totalShares: 36000073272527556882899934n,
      totalPoints: 150638406476208413823624784157856n,
      lastUpdate: 1713421571n,
    },
    "0x186514400e52270cef3D80e1c6F8d10A75d47344": {
      id: "0x186514400e52270cef3D80e1c6F8d10A75d47344",
      totalShares: 3598839592446703193992937n,
      totalPoints: 36092558843175402579851938460880n,
      lastUpdate: 1713377867n,
    },
    "0x38989BBA00BDF8181F4082995b3DEAe96163aC5D": {
      id: "0x38989BBA00BDF8181F4082995b3DEAe96163aC5D",
      totalShares: 11147158767033518156131n,
      totalPoints: 84685508194929118375296582864n,
      lastUpdate: 1713399275n,
    },
    "0xdd0f28e19C1780eb6396170735D45153D261490d": {
      id: "0xdd0f28e19C1780eb6396170735D45153D261490d",
      totalShares: 7836796779420095518474917n,
      totalPoints: 14161935483328970960766263400648n,
      lastUpdate: 1713339491n,
    },
    "0x95EeF579155cd2C5510F312c8fA39208c3Be01a8": {
      id: "0x95EeF579155cd2C5510F312c8fA39208c3Be01a8",
      totalShares: 4441256634343308013795146n,
      totalPoints: 5404233607301144379055499950356n,
      lastUpdate: 1713414035n,
    },
  },
  metaMorphoPositions: {
    "0x135ed163b972a21d06bc2d6a2ecffb9e0970c845a4b163f6a7ffb062f6a66e04": {
      id: "0x135ed163b972a21d06bc2d6a2ecffb9e0970c845a4b163f6a7ffb062f6a66e04",
      metaMorpho: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 337810840628184125856652n,
      supplyPoints: 4697649292479389987214909641520n,
      lastUpdate: 1712058335n,
    },
    "0x2698365e5031ce9848e895feaff9313dedbaa1d78e7750b1bc7dca2a75f36a13": {
      id: "0x2698365e5031ce9848e895feaff9313dedbaa1d78e7750b1bc7dca2a75f36a13",
      metaMorpho: "0x186514400e52270cef3D80e1c6F8d10A75d47344",
      user: "0xf2e018258a20a046Df85194e93db566A492DB1EB",
      shares: 1998067203056669746n,
      supplyPoints: 0n,
      lastUpdate: 1706025887n,
    },
    "0x772f6eb353634a2137fdfa01023102a43056a769c9f92bad8964fdfbcfd024c4": {
      id: "0x772f6eb353634a2137fdfa01023102a43056a769c9f92bad8964fdfbcfd024c4",
      metaMorpho: "0x38989BBA00BDF8181F4082995b3DEAe96163aC5D",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 221564678847136211727n,
      supplyPoints: 0n,
      lastUpdate: 1704825575n,
    },
    "0xac2669b28c4edde8fec115a21fe0341df594ef41071404b2d379e96a22befb76": {
      id: "0xac2669b28c4edde8fec115a21fe0341df594ef41071404b2d379e96a22befb76",
      metaMorpho: "0x38989BBA00BDF8181F4082995b3DEAe96163aC5D",
      user: "0xf2e018258a20a046Df85194e93db566A492DB1EB",
      shares: 0n,
      supplyPoints: 1469444819719737641040n,
      lastUpdate: 1704892499n,
    },
    "0xd3c0baf52e4ab511c935f232c826d4e3d97f342df17aae2a27a77c5a1166f9dd": {
      id: "0xd3c0baf52e4ab511c935f232c826d4e3d97f342df17aae2a27a77c5a1166f9dd",
      metaMorpho: "0xdd0f28e19C1780eb6396170735D45153D261490d",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 385023822484733137169743n,
      supplyPoints: 0n,
      lastUpdate: 1710339791n,
    },
    "0xd58dd7ddfb0e74ceda438fb9e4734d08ca67331bec658980bcb5bb4f6a499c16": {
      id: "0xd58dd7ddfb0e74ceda438fb9e4734d08ca67331bec658980bcb5bb4f6a499c16",
      metaMorpho: "0x95EeF579155cd2C5510F312c8fA39208c3Be01a8",
      user: "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
      shares: 345359661696544378268773n,
      supplyPoints: 0n,
      lastUpdate: 1712058863n,
    },
  },
};
describe("Users loader", () => {
  let fetchStub: sinon.SinonStub;

  beforeAll(() => {
    setConfig({
      cacheEnabled: false,
    });
  });
  beforeEach(() => {
    fetchStub = sinon.stub(global, "fetch");

    fetchStub.callsFake(async (url, options) => {
      switch (url) {
        case "http://subgraph.url":
          return new Response(JSON.stringify(userQueryResp), { status: 200 });

        default:
          return new Response(JSON.stringify({ errors: [{ message: "Error" }] }), { status: 500 });
      }
    });
  });
  afterEach(() => {
    fetchStub.restore();
  });

  it("should be able to fetch for one user only", async () => {
    const data = await loadFullForUsers(
      {
        url: "http://subgraph.url",
      },
      19680823,
      ["0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2"]
    );

    expect(fetchStub.calledOnce).toBeTruthy();
    const call = fetchStub.getCall(0);
    expect(fetchStub.calledWith("http://subgraph.url")).toBeTruthy();

    expect(call.lastArg.method).toBe("POST");
    const body = JSON.parse(call.lastArg.body);
    expect(body.query).toBeDefined();
    expect(body.query).toBe(usersLoaderQuery);
    expect(body.variables).toBeDefined();
    expect(body.variables).toStrictEqual({
      block: 19680823,
      first: 1000,
      users: ["0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2"],
      lastPositionsId: "",
      lastMetaMorphoPositionsId: "",
    });
    expect(data).toStrictEqual(oneUserParsedState);
  });

  it("should be able to fetch for multiple users", async () => {
    fetchStub.callsFake(async (url, options) => {
      switch (url) {
        case "http://subgraph.url":
          return new Response(JSON.stringify(twoUsersQueryResp), { status: 200 });

        default:
          return new Response(JSON.stringify({ errors: [{ message: "Error" }] }), { status: 500 });
      }
    });

    const data = await loadFullForUsers(
      {
        url: "http://subgraph.url",
      },
      19680823,
      ["0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2", "0xf2e018258a20a046Df85194e93db566A492DB1EB"]
    );

    expect(fetchStub.calledOnce).toBeTruthy();
    const call = fetchStub.getCall(0);
    expect(fetchStub.calledWith("http://subgraph.url")).toBeTruthy();

    expect(call.lastArg.method).toBe("POST");
    const body = JSON.parse(call.lastArg.body);
    expect(body.query).toBeDefined();
    expect(body.query).toBe(usersLoaderQuery);
    expect(body.variables).toBeDefined();
    expect(body.variables).toStrictEqual({
      block: 19680823,
      first: 1000,
      users: [
        "0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2",
        "0xf2e018258a20a046Df85194e93db566A492DB1EB",
      ],
      lastPositionsId: "",
      lastMetaMorphoPositionsId: "",
    });
    expect(data).toStrictEqual(twoUsersParsedState);
  });

  it("should be able to fetch for one user from the global loader", async () => {
    const data = await loadFromOneSubgraph(
      {
        url: "http://subgraph.url",
      },
      19680823,
      {
        users: ["0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2"],
      }
    );

    expect(fetchStub.calledOnce).toBeTruthy();
    const call = fetchStub.getCall(0);
    expect(fetchStub.calledWith("http://subgraph.url")).toBeTruthy();

    expect(call.lastArg.method).toBe("POST");
    const body = JSON.parse(call.lastArg.body);
    expect(body.query).toBeDefined();
    expect(body.query).toBe(usersLoaderQuery);
    expect(body.variables).toBeDefined();
    expect(body.variables).toStrictEqual({
      block: 19680823,
      first: 1000,
      users: ["0x6ABfd6139c7C3CC270ee2Ce132E309F59cAaF6a2"],
      lastPositionsId: "",
      lastMetaMorphoPositionsId: "",
    });
    expect(data).toStrictEqual(oneUserParsedState);

    expect(call.lastArg.method).toBe("POST");
  });
});

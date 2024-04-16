import { getAddress } from "viem";

import { State } from "../../src";

export const state = {
  data: {
    markets: [
      {
        id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
        totalSupplyShares: "1000000000000000000000000",
        totalBorrowShares: "900000000000000000000000",
        totalCollateral: "10000",
        totalSupplyPoints: "36000000000000000000000000",
        totalBorrowPoints: "0",
        totalCollateralPoints: "19680000",
        lastUpdate: "1712113403",
      },
      {
        id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
        totalSupplyShares: "500000000000",
        totalBorrowShares: "900246302003",
        totalCollateral: "4000000000000000000",
        totalSupplyPoints: "4418888682513304103796",
        totalBorrowPoints: "6752792770884622644300",
        totalCollateralPoints: "6770271578745516586530722520",
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
        supplyPoints: "0",
        borrowPoints: "6304686594341171851252854600",
        collateralPoints: "2464285725637273525921295808",
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
        supplyPoints: "85922809433476617893472",
        borrowPoints: "0",
        collateralPoints: "0",
        lastUpdate: "1712626379",
      },
    ],
    metaMorphos: [
      {
        id: "0x186514400e52270cef3d80e1c6f8d10a75d47344",
        totalShares: "3788388601456103634055160",
        totalPoints: "34039944574599186112836081238548",
        lastUpdate: "1712836667",
      },
      {
        id: "0x186514400e52270cef3d80e1c6f8d10a75d47345",
        totalShares: "3788388601456103634055160",
        totalPoints: "34039944574599186112836081238548",
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
        supplyPoints: "2185942811223110625091008",
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
        supplyPoints: "0",
        lastUpdate: "1706882015",
      },
    ],
  },
};

export const parsedState: State = {
  markets: {
    "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b": {
      id: "0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b",
      totalSupplyShares: 1000000000000000000000000n,
      totalBorrowShares: 900000000000000000000000n,
      totalCollateral: 10000n,
      totalSupplyPoints: 36000000000000000000000000n,
      totalBorrowPoints: 0n,
      totalCollateralPoints: 19680000n,
      lastUpdate: 1712113403n,
    },
    "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1": {
      id: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      totalSupplyShares: 500000000000n,
      totalBorrowShares: 900246302003n,
      totalCollateral: 4000000000000000000n,
      totalSupplyPoints: 4418888682513304103796n,
      totalBorrowPoints: 6752792770884622644300n,
      totalCollateralPoints: 6770271578745516586530722520n,
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
      supplyPoints: 0n,
      borrowPoints: 6304686594341171851252854600n,
      collateralPoints: 2464285725637273525921295808n,
      lastUpdate: 1712671931n,
    },
    "0x0045d9a5398203ffc24fea13c1814b628a36c65b805f1587bbf70f269385f0c2": {
      id: "0x0045d9a5398203ffc24fea13c1814b628a36c65b805f1587bbf70f269385f0c2",
      user: getAddress("0xebfa750279defa89b8d99bdd145a016f6292757b"),
      market: "0x06f2842602373d247c4934f7656e513955ccc4c377f0febc0d9ca2c3bcc191b1",
      supplyShares: 108739465364687797n,
      borrowShares: 0n,
      collateral: 0n,
      supplyPoints: 85922809433476617893472n,
      borrowPoints: 0n,
      collateralPoints: 0n,
      lastUpdate: 1712626379n,
    },
  },

  metaMorphos: {
    [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344")]: {
      id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      totalShares: 3788388601456103634055160n,
      totalPoints: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
    [getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345")]: {
      id: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47345"),
      totalShares: 3788388601456103634055160n,
      totalPoints: 34039944574599186112836081238548n,
      lastUpdate: 1712836667n,
    },
  },
  metaMorphoPositions: {
    "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11": {
      id: "0x0036580c4f423112bfec581af9a13c12bdbb0b2710cc204d8f3bbd21ef7d7f11",
      metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      user: getAddress("0x77155b7d373f2b22b5944b7434ba285c5fcefea9"),
      shares: 12666472865775207373n,
      supplyPoints: 2185942811223110625091008n,
      lastUpdate: 1712554427n,
    },
    "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c": {
      id: "0x003ac3dc9e02004b79fb3a3cc9cc7044f9ff3bfd66e0f8ac55649fa4465cbc3c",
      metaMorpho: getAddress("0x186514400e52270cef3d80e1c6f8d10a75d47344"),
      user: getAddress("0x408e986a277da059a90c4be5051f67c6e3fd5cff"),
      shares: 1499992396913558344n,
      supplyPoints: 0n,
      lastUpdate: 1706882015n,
    },
  },
};

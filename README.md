# Morpho Blue Points SDK

## Overview
The Morpho Blue Points SDK facilitates the distribution and management of shards and points within the ecosystems of Morpho and MetaMorpho users. It provides tools to accurately and efficiently compute and distribute these units of measure, enhancing rewards distribution over market positions.

## Definitions
- **Shard**: A unit of measure representing a user's participation in a market. Users accrue 1e-6 shards per market share per second. The precision of shards equals the precision of underlying market shares plus six decimal places. For example, the precision for supply shards in a market with USDC as the loan asset is 18 (6+6+6).

Shards are used for proportion computations due to their precision. 

## Features

### Distribute shards on the user markets 
The primary feature is the distribution of shards to users based on their market positions over time. This process utilizes a subgraph for indexing points.


To do so, you have to use a subgraph that is indexing the shards. 
You can check an example [here](https://github.com/morpho-org/morpho-blue-rewards-points) 

```typescript
import { getSnapshotFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getSnapshotFromSubgraph(subgraphUrl, {
    lastBlockNumber: 19191167,
    timestamp: 1707488903,
  });

  //dump the full state.
  console.log(pointsState);
};
```

### Compute the points & shards between two snapshots
Generally, you need to compute the points & shards between two timestamps. To do so, you can use the following function:

```typescript
import { getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  //dump the full state.
  console.log(pointsState);
}
```

### retrieve the user points & shards

The computation is redistributing to all the users. 

```typescript
import { getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const userAddress = "0x12345";
  const userPointsPerMarkets = Object.values(pointsState.positions).filter(
    ({ user }) => user === userAddress
  );

  const userPointsPerMetaMorpho = Object.values(pointsState.metaMorphoPositions).filter(
    ({ user }) => user === userAddress
  );

  //dump the full state.
  console.log(userPointsPerMarkets, userPointsPerMetaMorpho);
};

```
> **Note**: The metamorpho points are not the markets points. They represent the proportion of the user inside of the metamorpho vault. If you want to recover the markets points earned through the metamorpho vault, you have to check the redistribution section

## Redistribution

### Redistribute the points of the MetaMorpho vaults
MetaMorpho vaults acts as a proxy of multiple users and are accumulating points as the supply position on the morpho market is the vault itself. If you want to compute the markets points of the vault users, you have to redistribute the points. 

After a redistribution, metamorpho users have now a virtual position on blue with their market points accrued through the vault. We substract all the points redistributed to the vault position. Due to some approximation, the vault can have a small amount of points that are not redistributed.

> **Note**: if the user has a position in the market, the points are summed with the market points earned through the vault.

```typescript
import { redistributeMetaMorpho, getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const redistributedPoints = redistributeMetaMorpho(pointsState);

  //dump the full state.
  console.log(redistributedPoints);
};
```

There is also the possibility to redistribute only for a specific vault, and also a specific market if needed. 


## Redistribute the points of a MetaMorpho vault as collateral.

Morpho supports MetaMorpho as collateral in his model. It means that the Vault shares are transmitted to Morpho. In this case, Morpho itself is accruing vault points.

You can redistribute these points to the users that are using MetaMorpho as collateral. 
This is creating virtual vault positions for the users that are using the shares as collateral. 

```typescript
import { redistributeVaultAsCollateral, getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const { metaMorphoPositions } = redistributeVaultAsCollateral(pointsState);

  //dump the metamorpho positions state.
  console.log(metaMorphoPositions);
};
```

## Redistribute all markets points
Generally, you will need to redistribute all the market points. To do so, you have to first redistribute vault points if they are used as collateral, and then redistribute to metamorpho users. 
There is an helper function to do that:

```typescript

import { redistributeAll, getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const { positions } = redistributeAll(pointsState);

  //dump the positions state.
  console.log(positions);
};
```

## Modules

Modules are functions that take a state and return a modified state. They are used to modify the state to add custom functionalities.

### Blacklist module
The blacklist module remove all the points earned by a user (market & metamorpho points). 

```typescript

import { blacklistingAddress, getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const blackListedAddress = "0x"; // Can also be an array of addresses.
  const stateWithoutBlackListed = blacklistingAddress(pointsState, blackListedAddress);
  
  //dump the full state.
  console.log(stateWithoutBlackListed);
};
```

## Checkers

Checkers permits to apply some checks on the state. 
For example you can check if the market shards are consistent with the sum of the positions shards

```typescript

import { checkShardsConsistency, getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const { hasInconsistency } = checkShardsConsistency(pointsState);
  
  console.log(hasInconsistency);
};

```
since there is no division on the shards accounting, the shards should always be consistent.

This is not always true for the points, because of multiple roundings issues when accruing them. That's why the points are not used for the computation, but only for the display.

You can still check the points consistency with the following function that is taking a precision in argument:
```typescript

import { checkPointsConsistency, getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: subgraphUrl,
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  const { hasInconsistency } = checkPointsConsistency(pointsState);
  
  console.log(hasInconsistency);
};

```

The consistency checkers are returning the state with the market & the vault points/shards reduced from the positions. It can help you to dump the state and check the inconsistencies.

## Quorum security
The main security concern of this kind of distribution mechanism is the reliability of a subgraph. 
To mitigate that, you can fetch multiple states from different subgraphs and check if the states are the same. 


```typescript

import { getTimeframeFromSubgraph } from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  
  const satsumaSubgraphUrl = "";
  const selfHostedSubgraphUrl = "";
  const hostedServiceUrl = "";
  const pointsState = await getTimeframeFromSubgraph({
    subgraphs: [
      {
        url: satsumaSubgraphUrl,
        init: {
          headers: {
            "X-API-KEY": process.env.SATSUMA_API_KEY!,
          },
        },
      },
      {
        url: selfHostedSubgraphUrl,
        init: {
          headers: {
            token: "Bearer " + process.env.SELF_HOSTED_API_KEY!,
          },
        },
      },
      hostedServiceUrl,
    ],
    from: {
      lastBlockNumber: 18977038,
      timestamp: 1704895619,
    },
    to: {
      lastBlockNumber: 19191167,
      timestamp: 1707488903,
    },
  });

  console.log(pointsState);
};
```


## Programs

Programs are a set of utilities to help you to redistribute tokens rewards by using the shards computation. 
It helps you to build a merkle tree for a specific period.

### Time Bounded Market Program 
The time bounded market program is a program that is redistributing the rewards of a market for a specific period.
The first step is to compute the rewards earned by each users

```typescript
import {
  computeTimeBoundedMarketRewards,
  TimeBoundedMarketProgram,
} from "@morpho-org/blue-points-sdk";

const distribute = async (subgraphUrl: string) => {
  const program: TimeBoundedMarketProgram = {
    from: {
      timestamp: 1704895619,
      lastBlockNumber: 18977038,
    },
    to: {
      timestamp: 1707488903,
      lastBlockNumber: 19191167,
    },

    market: "0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41",
    rewardToken: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    tokensToDistributeSupplySide: 7172090407823554462n,
  };

  const { lookupTree, merkleTree, rewards } = await computeTimeBoundedMarketRewards(
    subgraphUrl,
    program
  );
};
```

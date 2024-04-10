import { UserRewards } from "./programs";
import { Address, getAddress } from "viem";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const orderAndArrayifyLeaves = (userRewards: UserRewards[]) =>
  userRewards
    .sort((a, b) => {
      const userComparison = a.user.toLowerCase().localeCompare(b.user.toLowerCase());
      if (userComparison !== 0) return userComparison;
      return a.rewardToken.toLowerCase().localeCompare(b.rewardToken.toLowerCase());
    })
    .map(
      ({ user, rewardToken, rewards }) =>
        [
          // The order is defined here: https://github.com/morpho-org/universal-rewards-distributor/blob/main/src/UniversalRewardsDistributor.sol#L122
          getAddress(user),
          getAddress(rewardToken),
          rewards.toString(),
        ] as [string, string, string]
    );

export const computeMerkleTree = (userRewards: UserRewards[]) => {
  const orderedLeaves = orderAndArrayifyLeaves(userRewards);

  const merkleTree = StandardMerkleTree.of(orderedLeaves, ["address", "address", "uint256"]);

  const lookupTree: {
    [user: string]: {
      [token: string]: {
        amount: string;
        proof: string[];
      };
    };
  } = {};

  orderedLeaves.forEach(([user, token, amount]) => {
    // It builds the ordered lookup tree
    const balances = (lookupTree[user] ??= {});
    balances[token] = {
      amount: amount.toString(),
      proof: merkleTree.getProof([user, token, amount]),
    };
  });

  return { merkleTree, lookupTree };
};

export const mergeTrees = (leavesRegistry: UserRewards[][]) => {
  const perUserPerToken = leavesRegistry.flat(1).reduce(
    (acc, { user, rewardToken, rewards }) => {
      const balances = (acc[user] ??= {});
      balances[rewardToken] ??= 0n;
      balances[rewardToken] += rewards;
      return acc;
    },
    {} as { [user: string]: { [token: string]: bigint } }
  );

  const leaves = Object.entries(perUserPerToken).flatMap(([user, tokens]) =>
    Object.entries(tokens).map(
      ([rewardToken, rewards]): UserRewards => ({
        user: user as Address,
        rewardToken: rewardToken as Address,
        rewards,
      })
    )
  );
  return {
    leaves,
    ...computeMerkleTree(leaves),
  };
};

/**
 * Check if all the new leaves are consistent with the previous leaves.
 * It returns the inconsistencies.
 *
 * Inconsistency is defined as:
 * - A leaf is missing in the new leaves
 * - A leaf has less rewards than the previous leaf
 *
 */
export const areNewLeavesConsistents = (
  previousLeaves: UserRewards[],
  newLeaves: UserRewards[]
): {
  hasInconsistencies: boolean;
  inconsistencies: UserRewards[];
} => {
  const inconsistencies = previousLeaves.filter(({ user, rewardToken, rewards }) => {
    const newLeaf = newLeaves.find(
      (leaf) => leaf.user === user && leaf.rewardToken === rewardToken
    );
    return !newLeaf || newLeaf.rewards < rewards;
  });
  return {
    hasInconsistencies: inconsistencies.length > 0,
    inconsistencies,
  };
};

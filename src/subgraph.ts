export interface ISubgraphError {
  message: string;
  location: any[];
}

export type SubgraphResult<T> = { data: T } | { errors: ISubgraphError[] };

export class SubgraphError extends Error {
  constructor(public errors: ISubgraphError[]) {
    super(`Subgraph error: ${JSON.stringify(errors, null, 2)}`);
  }
}
export const fetchSubgraph = async <T>(
  subgraphUrl: string,
  query: string,
  variables?: object,
  init?: RequestInit
) => {
  const body: { query: string; variables?: object } = {
    query,
  };
  if (variables) {
    body["variables"] = variables;
  }

  const subgraphResult: SubgraphResult<T> = await fetch(subgraphUrl, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Subgraph error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  });

  if ("errors" in subgraphResult) {
    throw new SubgraphError(subgraphResult.errors);
  }
  return subgraphResult.data;
};

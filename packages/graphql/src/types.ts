/**
 * Port for cache revalidation. Resolvers notify through this interface;
 * the transport (frontend HTTP endpoints, auth) is provided by the caller
 * (see the backend package), keeping this package free of HTTP knowledge.
 */
export interface Revalidater {
  revalidateAllBlog: () => Promise<void>;
  revalidateBlog: (slug: string) => Promise<void>;
  revalidateAllContext: () => Promise<void>;
  revalidateContext: (slug: string) => Promise<void>;
}

export type GraphQLContext = {
  DB: D1Database;
  revalidater: Revalidater;
};

/**
 * Full-text search + filters + pagination for live listings.
 */
export const searchService = {
  async search(_query: unknown): Promise<never> {
    throw new Error("searchService.search is not implemented");
  },
};

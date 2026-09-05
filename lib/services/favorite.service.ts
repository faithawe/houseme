/**
 * Save, unsave, and list a user's favorite listings.
 */
export const favoriteService = {
  async list(_userId: string): Promise<never> {
    throw new Error("favoriteService.list is not implemented");
  },
  async save(_userId: string, _listingId: string): Promise<never> {
    throw new Error("favoriteService.save is not implemented");
  },
  async unsave(_userId: string, _listingId: string): Promise<never> {
    throw new Error("favoriteService.unsave is not implemented");
  },
};

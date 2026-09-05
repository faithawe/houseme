/**
 * Admin review queue: approve, reject (reason required), flag, stats.
 */
export const adminService = {
  async listListings(_status?: string): Promise<never> {
    throw new Error("adminService.listListings is not implemented");
  },
  async approve(_listingId: string, _adminId: string): Promise<never> {
    throw new Error("adminService.approve is not implemented");
  },
  async reject(_listingId: string, _adminId: string, _reason: string): Promise<never> {
    throw new Error("adminService.reject is not implemented");
  },
  async flag(_listingId: string, _adminId: string): Promise<never> {
    throw new Error("adminService.flag is not implemented");
  },
  async stats(): Promise<never> {
    throw new Error("adminService.stats is not implemented");
  },
};

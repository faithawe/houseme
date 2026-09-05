/**
 * Listing view counts and contact-click events.
 */
export const analyticsService = {
  async trackView(_listingId: string): Promise<never> {
    throw new Error("analyticsService.trackView is not implemented");
  },
  async trackContact(_listingId: string, _userId?: string): Promise<never> {
    throw new Error("analyticsService.trackContact is not implemented");
  },
};

/**
 * Address → lat/lng via Mapbox, with city-center fallback.
 */
export const geocodingService = {
  async geocode(_address: string, _city: string): Promise<never> {
    throw new Error("geocodingService.geocode is not implemented");
  },
};

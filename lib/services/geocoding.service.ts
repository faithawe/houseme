/**
 * Address → lat/lng via Mapbox Geocoding (free tier token).
 * Falls back to Nigerian city-center coordinates when unset or on failure.
 */
const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Abuja: { lat: 9.0765, lng: 7.3986 },
  Jos: { lat: 9.8965, lng: 8.8583 },
  Ibadan: { lat: 7.3775, lng: 3.947 },
  "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
  Kano: { lat: 12.0022, lng: 8.592 },
  Enugu: { lat: 6.5244, lng: 7.5105 },
  Kaduna: { lat: 10.5105, lng: 7.4165 },
};

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  source: "mapbox" | "city_fallback";
};

export const geocodingService = {
  isConfigured() {
    return Boolean(
      process.env.MAPBOX_SECRET?.trim() ||
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim(),
    );
  },

  async geocode(address: string, city: string): Promise<GeocodeResult> {
    const token =
      process.env.MAPBOX_SECRET?.trim() ||
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();

    const query = `${address}, ${city}, Nigeria`.trim();

    if (token) {
      try {
        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        );
        url.searchParams.set("access_token", token);
        url.searchParams.set("country", "ng");
        url.searchParams.set("limit", "1");

        const response = await fetch(url.toString(), {
          next: { revalidate: 86400 },
        });
        if (response.ok) {
          const json = (await response.json()) as {
            features?: { center?: [number, number] }[];
          };
          const center = json.features?.[0]?.center;
          if (center) {
            return {
              longitude: center[0],
              latitude: center[1],
              source: "mapbox",
            };
          }
        }
      } catch (error) {
        console.warn("[geocode] Mapbox failed, using city fallback", error);
      }
    }

    const fallback = CITY_CENTERS[city] ?? CITY_CENTERS.Lagos;
    return {
      latitude: fallback.lat,
      longitude: fallback.lng,
      source: "city_fallback",
    };
  },
};

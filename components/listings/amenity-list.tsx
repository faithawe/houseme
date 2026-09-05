import { AMENITY_LABELS, AMENITIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function AmenityList({
  amenities,
}: {
  amenities: (typeof AMENITIES)[number][];
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <li key={amenity}>
          <Badge variant="palm">{AMENITY_LABELS[amenity]}</Badge>
        </li>
      ))}
    </ul>
  );
}

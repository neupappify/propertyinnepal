export type PropertyFeature = { name: string; value: string; icon?: string };
export type PropertyItem = {
  id: string; slug: string; code: string; type: string; for: string; name: string;
  area: string; location: string; city: string; price: string; views: string;
  description: string; youtube_link: string | null; tiktok_link: string | null;
  is_featured: string; is_premium: string; features: PropertyFeature[];
  facilities: PropertyFeature[]; created_at: string; created_at_human: string;
  images: string[]; on_calling: string;
  team: { id?: string; name?: string; position?: string } | string | null;
  team_image: string | null;
};
export type ListingPagePayload = { items: PropertyItem[]; currentPage: number; totalPages: number; totalItems: number };

type ListingRecord = Record<string, unknown>;
const asRecord = (value: unknown): ListingRecord => value && typeof value === "object" && !Array.isArray(value) ? value as ListingRecord : {};
const asString = (value: unknown) => typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
const titleCase = (value: string) => value.trim().toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

// Read listing records from either the direct response or the standard result envelope.
export function getListingResponse(value: unknown) {
  const body = asRecord(value);
  const result = asRecord(body.result);
  const meta = asRecord(body.meta ?? result.meta);
  const rows = Array.isArray(body.listings)
    ? body.listings
    : Array.isArray(result.listings)
      ? result.listings
      : Array.isArray(body.data)
        ? body.data
        : Array.isArray(result.data)
          ? result.data
          : Array.isArray(body.result)
            ? body.result
            : [];
  const totalCount = Number(body.totalCount ?? result.totalCount ?? meta.total);
  return {
    listings: rows,
    totalCount: Number.isFinite(totalCount) && totalCount >= 0 ? totalCount : rows.length,
  };
}

// Convert an SDK listing record into the fields used by the existing property cards.
export function mapProperty(record: unknown): PropertyItem {
  const listing = asRecord(record);
  const details = asRecord(listing.details);
  const source = asRecord(details.source);
  const location = asRecord(listing.location);
  const structured = asRecord(location.structured ?? listing.structuredLocation);
  const rawPrice = asRecord(listing.price);
  const amount = rawPrice.amount;
  const price = amount != null ? Number(amount).toLocaleString("en-US") : "On Call";
  const images = Array.isArray(listing.images) ? listing.images.map((image) => typeof image === "string" ? image : asString(asRecord(image).url)).filter(Boolean) : [];
  const groups = ["house", "apartment", "land", "flat", "space"].map((key) => asRecord(details[key]));
  const features = groups.flatMap((group) => Object.entries({
    Bedrooms: group.bedrooms, Bathrooms: group.bathrooms, "Living Rooms": group.livingRooms,
    "Dining Rooms": group.diningRooms, Kitchens: group.kitchens, Floors: group.floors,
    "Car Parking": group.carParkingSpots, "Bike Parking": group.bikeParkingSpots,
    Area: group.area, Facing: listing.facing,
  }).filter(([, value]) => value != null && value !== "" && value !== 0).map(([name, value]) => ({ name, value: String(value) })));
  const amenities = Array.isArray(listing.amenities) ? listing.amenities : [];
  const createdAt = asString(listing.createdAt);
  const listedBy = asRecord(listing.listedBy);
  return {
    id: asString(listing.id) || asString(listing.slug), slug: asString(listing.slug) || asString(listing.id),
    code: asString(listing.customId) || asString(listing.id), type: titleCase(asString(listing.category) || "Property"),
    for: asString(listing.purpose).toLowerCase(), name: asString(listing.title) || "Untitled property",
    area: asString(listing.area) || "N/A", location: asString(location.text) || asString(structured.locality) || "Nepal",
    city: asString(structured.city) || "Nepal", price, views: asString(source.views) || "0",
    description: asString(listing.description), youtube_link: null, tiktok_link: null,
    is_featured: listing.isFeatured === true ? "1" : "0", is_premium: listing.isFeatured === true ? "1" : "0",
    features, facilities: amenities.map((item) => ({ name: titleCase(typeof item === "string" ? item : asString(asRecord(item).name)), value: "Yes" })),
    created_at: createdAt, created_at_human: createdAt ? new Date(createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "",
    images, on_calling: amount == null ? "1" : "0",
    team: asString(listedBy.displayName) || null, team_image: asString(listedBy.displayImage) || null,
  };
}

export function formatPropertyPrice(price: string | null | undefined, onCalling: string | null | undefined, label = "On Call") {
  if (onCalling === "1" || !price?.trim() || /^on call$/i.test(price.trim())) return label;
  return `NRs. ${price.trim().toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase())}`;
}
export const getDisplayValue = (value: string | null | undefined) => value?.trim() || "N/A";
export const getFeatureValue = (features: PropertyFeature[] | undefined, matchers: RegExp[]) => features?.find((item) => matchers.some((matcher) => matcher.test(`${item.name} ${item.value}`)))?.value?.trim() || null;
export const getBedroomValue = (features: PropertyFeature[] | undefined) => getFeatureValue(features, [/bed/i]) ?? "N/A";
export const getBathroomValue = (features: PropertyFeature[] | undefined) => getFeatureValue(features, [/bath/i]) ?? "N/A";
export const getSpaceValue = (area: string | undefined) => getDisplayValue(area);
export const formatCountLabel = (value: string, label: string) => value === "N/A" || /[a-z]/i.test(value) ? value : `${value} ${label}`;

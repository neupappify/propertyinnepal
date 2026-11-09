import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { estate } from "@neup/logica/estate";
import { DragScrollCarousel } from "@/components/drag-scroll-carousel";
import PropertyCardS1 from "@/components/estate/propertyCard.s1";
import { PropertyAgentContactCard } from "@/components/property-agent-contact-card";
import { PropertyAmenitiesGrid } from "@/components/property-amenities-grid";
import { PropertyFloatingAgentSidebar } from "@/components/property-floating-agent-sidebar";
import { PropertyLifeAroundArea } from "@/components/property-life-around-area";
import { PropertyPhotoGallery } from "@/components/property-photo-gallery";
import { PropertyShareButton } from "@/components/property-share-button";
import {
  mapProperty,
  formatPropertyPrice,
  type PropertyFeature,
  type PropertyItem,
} from "@/lib/property-presentation";
import { PROPERTY_AGENT_FALLBACK } from "./property-agent";

type PropertyDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await estate.listings(slug).get([
    "id", "customId", "slug", "title", "description", "purpose", "category", "types",
    "images", "location", "price", "pricing", "amenities", "listings.details", "listings.spacing",
  ]);
  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to fetch property: ${response.status}`);
  }

  if (!response.body?.listing) {
    return {
      title: "Property Not Found",
    };
  }

  const property = mapProperty(response.body.listing);

  return {
    title: property.name,
    description: `${property.location}, ${property.city} • ${property.price}`,
  };
}

function renderPrice(price: string, onCalling: string) {
  return formatPropertyPrice(price, onCalling, "मूल्य सम्पर्कमा");
}

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderTeam(team: { id?: string; name?: string; position?: string } | string | null) {
  if (!team) return "N/A";
  if (typeof team === "string") return team;
  if (team.name && team.position) return `${team.name} (${team.position})`;
  if (team.name) return team.name;
  return "N/A";
}

function getTeamName(team: { id?: string; name?: string; position?: string } | string | null) {
  if (!team) return "Property in Nepal";
  if (typeof team === "string") return team;
  return team.name || "Property in Nepal";
}

function getTeamRole(team: { id?: string; name?: string; position?: string } | string | null) {
  if (!team || typeof team === "string") return "Property Advisor";
  return team.position || "Property Advisor";
}

function getRoomsAndSpacingFeatures(
  features: { name: string; value: string }[],
  area: string,
) {
  const priorityOrder = [
    "Bedrooms",
    "Bathrooms",
    "Attached Bathrooms",
    "Living Rooms",
    "Dining Rooms",
    "Kitchens",
    "Floors",
    "Car Parking",
    "Bike Parking",
    "Road Access",
    "Facing",
    "Furnishing",
    "House Type",
    "Built Year",
    "Pooja Room",
    "Store Room",
    "Study Room",
    "Land Size",
    "Area",
  ];
  const labelOverrides: Record<string, string> = {
    attachedbathroom: "Attached Bathrooms",
    attachedbathrooms: "Attached Bathrooms",
    bathroom: "Bathrooms",
    bathrooms: "Bathrooms",
    bedroom: "Bedrooms",
    bedrooms: "Bedrooms",
    buildyear: "Built Year",
    builtyear: "Built Year",
    carparking: "Car Parking",
    carparkings: "Car Parking",
    faced: "Facing",
    facing: "Facing",
    floor: "Floors",
    floors: "Floors",
    furnishing: "Furnishing",
    housetype: "House Type",
    kitchen: "Kitchens",
    kitchens: "Kitchens",
    landsize: "Land Size",
    livingroom: "Living Rooms",
    livingrooms: "Living Rooms",
    poojaroom: "Pooja Room",
    roadaccess: "Road Access",
    bathroomattached: "Attached Bathrooms",
    storeroom: "Store Room",
    studyroom: "Study Room",
  };

  const normalizeFeatureName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const getDisplayName = (name: string) => {
    const normalizedName = normalizeFeatureName(name);
    return labelOverrides[normalizedName] ?? toTitleCase(name);
  };

  const orderedFeatures: { name: string; value: string }[] = [];
  const seen = new Set<string>();

  for (const feature of features) {
    const value = feature.value?.trim();
    if (!value || value === "0") continue;

    const name = getDisplayName(feature.name);
    const key = `${normalizeFeatureName(name)}:${value.toLowerCase()}`;
    if (seen.has(key)) continue;

    seen.add(key);
    orderedFeatures.push({ name, value });
  }

  if (area && area !== "N/A") {
    const areaKey = `${normalizeFeatureName("Area")}:${area.toLowerCase()}`;
    if (!seen.has(areaKey)) {
      seen.add(areaKey);
      orderedFeatures.push({ name: "Area", value: area });
    }
  }

  return orderedFeatures.sort((left, right) => {
    const leftIndex = priorityOrder.indexOf(left.name);
    const rightIndex = priorityOrder.indexOf(right.name);
    const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (normalizedLeftIndex !== normalizedRightIndex) {
      return normalizedLeftIndex - normalizedRightIndex;
    }

    return left.name.localeCompare(right.name);
  });
}

function getSummaryFeatures(features: { name: string; value: string }[]) {
  const summaryNames = new Set([
    "Bedrooms",
    "Bathrooms",
    "Living Rooms",
    "Dining Rooms",
    "Kitchens",
    "Floors",
    "Car Parking",
    "Bike Parking",
    "Area",
  ]);

  return features.filter((feature) => summaryNames.has(feature.name));
}

function getFeatureValue(
  features: PropertyFeature[] | undefined,
  matchers: RegExp[],
) {
  if (!features?.length) return null;

  const feature = features.find((item) =>
    matchers.some((matcher) => matcher.test(`${item.name} ${item.value}`)),
  );

  return feature?.value || null;
}

function formatCountLabel(value: string | null, label: string) {
  return value ? `${value} ${label}` : `N/A ${label}`;
}

function formatPropertyKind(type: string) {
  const normalizedType = type.trim();
  return normalizedType ? normalizedType.toLowerCase() : "property";
}

function formatPurpose(value: string) {
  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue.toLowerCase() : "listing";
}

function formatAboutFeatureList(features: { name: string; value: string }[]) {
  const details = features
    .filter((feature) => feature.name !== "Area")
    .map((feature) => `${feature.value} ${feature.name}`);

  if (details.length === 0) return null;
  if (details.length === 1) return details[0];
  if (details.length === 2) return `${details[0]} and ${details[1]}`;

  return `${details.slice(0, -1).join(", ")}, and ${details[details.length - 1]}`;
}

function formatSentenceList(values: string[]) {
  const normalizedValues = values.map((value) => value.trim()).filter(Boolean);

  if (normalizedValues.length === 0) return null;
  if (normalizedValues.length === 1) return normalizedValues[0];
  if (normalizedValues.length === 2) return `${normalizedValues[0]} and ${normalizedValues[1]}`;

  return `${normalizedValues.slice(0, -1).join(", ")}, and ${
    normalizedValues[normalizedValues.length - 1]
  }`;
}

function getAmenityList(facilities: PropertyFeature[]) {
  return formatSentenceList(
    facilities
      .map((facility) => facility.name || facility.value)
      .filter(Boolean)
      .slice(0, 12),
  );
}

type RoomsAndSpacingIconName =
  | "bed"
  | "shower"
  | "sofa"
  | "utensils"
  | "car"
  | "bike"
  | "area"
  | "floors"
  | "default";

function getRoomsAndSpacingIconName(name: string): RoomsAndSpacingIconName {
  const normalizedName = name.toLowerCase().replace(/[^a-z]/g, "");

  if (normalizedName === "bedroom" || normalizedName === "bedrooms") return "bed";
  if (normalizedName === "bathroom" || normalizedName === "bathrooms") return "shower";
  if (normalizedName === "livingroom" || normalizedName === "livingrooms") return "sofa";
  if (normalizedName === "kitchen" || normalizedName === "kitchens") return "utensils";
  if (normalizedName === "carparking" || normalizedName === "carparkings") return "car";
  if (normalizedName === "bikeparking" || normalizedName === "bikeparkings") return "bike";
  if (normalizedName === "area") return "area";
  if (normalizedName === "floor" || normalizedName === "floors") return "floors";

  return "default";
}

function RoomsAndSpacingIcon({ name }: { name: string }) {
  const iconName = getRoomsAndSpacingIconName(name);
  const className = "size-4 fill-none stroke-current stroke-[2] sm:size-[18px]";

  if (iconName === "bed") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M3 11V6.5A1.5 1.5 0 0 1 4.5 5h4A2.5 2.5 0 0 1 11 7.5V11" />
        <path d="M11 11V7.5A2.5 2.5 0 0 1 13.5 5h4A1.5 1.5 0 0 1 19 6.5V11" />
        <path d="M3 11h18v7M3 18v-7M3 15h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (iconName === "shower") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M4 12h16v2.5A4.5 4.5 0 0 1 15.5 19h-7A4.5 4.5 0 0 1 4 14.5V12Z" strokeLinejoin="round" />
        <path d="M6 12V6.5A2.5 2.5 0 0 1 8.5 4H9a2 2 0 0 1 2 2" strokeLinecap="round" />
        <path d="M9 8h4M7 21h10" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconName === "sofa") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M7 12V8.5A2.5 2.5 0 0 1 9.5 6h5A2.5 2.5 0 0 1 17 8.5V12" />
        <path d="M5 12h14a2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
        <path d="M5 20v-2M19 20v-2" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconName === "utensils") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 3h5l-3 8h3l-5 10v-8h-3l3-10Z" strokeLinejoin="round" />
      </svg>
    );
  }

  if (iconName === "car") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M5 13 7 7h10l2 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 13h16v5H4z" strokeLinejoin="round" />
        <path d="M7 18v2M17 18v2M7 15h.01M17 15h.01" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconName === "bike") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M8.5 17h3.5l3-5H9.5l-1 5ZM15 12l3 5M11 9h3M13 9l-1 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (iconName === "area") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M4 4h16v16H4z" strokeLinejoin="round" />
        <path d="M8 8h8v8H8z" strokeLinejoin="round" />
      </svg>
    );
  }

  if (iconName === "floors") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M4 18h16M6 14h12M8 10h8M10 6h4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 18v-4M18 18v-4M8 14v-4M16 14v-4M10 10V6M14 10V6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M4 12h16M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RoomsAndSpacingCard({ feature }: { feature: { name: string; value: string } }) {
  return (
    <div className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center transition-colors duration-200 hover:border-brand-deep/35 hover:bg-sky-50/75 sm:p-4">
      <div className="flex min-h-[80px] flex-col items-center justify-center sm:min-h-[88px]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(180deg,rgba(0,180,234,0.14),rgba(31,59,123,0.08))] text-brand-deep sm:size-10">
          <RoomsAndSpacingIcon name={feature.name} />
        </div>
        <p className="mt-2 text-center text-[13px] font-semibold leading-[1.2] text-slate-950 sm:mt-2.5 sm:text-sm sm:leading-[1.25]">
          <span className="text-[15px] text-brand-deep sm:text-base">{feature.value}</span>{" "}
          <span>{feature.name}</span>
        </p>
      </div>
    </div>
  );
}

function RecommendedPropertyCard({ property }: { property: PropertyItem }) {
  const bedroomValue = getFeatureValue(property.features, [/bed/i, /bedroom/i]);
  const bathroomValue = getFeatureValue(property.features, [/bath/i, /bathroom/i]);
  const location = [property.location, property.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <PropertyCardS1
      className="h-full"
      href={`/properties/${property.id}`}
      imageAlt={property.name}
      imageSrc={property.images?.[0] ?? "/logo.png"}
      agentImageSrc={property.team_image}
      title={property.name}
      status={property.for}
      price={formatPropertyPrice(property.price, property.on_calling)}
      priceTag={formatPropertyPrice(property.price, property.on_calling)}
      propertyType={property.type}
      location={location || "N/A"}
      bedroomLabel={formatCountLabel(bedroomValue, "Beds")}
      bathroomLabel={formatCountLabel(bathroomValue, "Baths")}
      areaLabel={property.area || "N/A"}
    />
  );
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { slug } = await params;
  const [response, recommendedResponse] = await Promise.all([
    estate.listings(slug).get([
      "id", "customId", "slug", "title", "description", "purpose", "category", "types",
      "images", "location", "price", "pricing", "amenities", "listings.details", "listings.spacing",
      "representatives.*",
    ]),
    estate.listings.search({ agencyId: process.env.NEUP_ESTATE_PROJECT_ID, limit: 15, offset: 0 }),
  ]);

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to fetch property: ${response.status}`);
  }
  if (!response.body?.listing) {
    notFound();
  }
  const property = mapProperty(response.body.listing);

  const recommendedRecords = recommendedResponse.body?.listings ?? [];
  const recommendedProperties = recommendedRecords.map(mapProperty)
    .filter((item) => item.id !== property.id && item.slug !== property.slug)
    .slice(0, 8);
  const roomsAndSpacingFeatures = getRoomsAndSpacingFeatures(property.features, property.area);
  const aboutFeatureList = formatAboutFeatureList(getSummaryFeatures(roomsAndSpacingFeatures));
  const amenityList = getAmenityList(property.facilities);
  const propertyKind = formatPropertyKind(property.type);
  const propertyPurpose = formatPurpose(property.for);
  const propertyLocation = [property.location, property.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
  const agentName = getTeamName(property.team);
  const agentRole = getTeamRole(property.team);

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-3 lg:px-8 lg:pt-4">
        {property.images?.length > 0 ? (
          <PropertyPhotoGallery images={property.images} title={property.name} />
        ) : null}
      </section>

      <div className="relative [--property-content-bottom-space:3rem]">
        <PropertyFloatingAgentSidebar>
          <PropertyAgentContactCard
            agentImageSrc={property.team_image}
            agentName={agentName}
            agentRole={agentRole}
            phone={PROPERTY_AGENT_FALLBACK.phone}
            email={PROPERTY_AGENT_FALLBACK.email}
            display="desktop"
          />
        </PropertyFloatingAgentSidebar>

        <section className="mx-auto max-w-[1440px] px-6 pb-8 lg:px-8 lg:pr-[calc(360px+40px+2rem)]">
          <div className="max-w-5xl">
            <p className="text-sm font-medium text-slate-500 sm:text-base">
              Property ID: {property.code}
              <span className="mx-2 inline-block h-1 w-1 rounded-full bg-slate-300 align-middle" />
              {property.type}
              <span className="mx-2 inline-block h-1 w-1 rounded-full bg-slate-300 align-middle" />
              {toTitleCase(property.for)}
            </p>

            <div className="mt-1">
              <h1 className="max-w-4xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                <span>{property.name}</span>
                <span className="inline-block w-4" aria-hidden="true" />
                <PropertyShareButton title={property.name} />
              </h1>
            </div>

            <p className="mt-0.5 text-xl font-semibold text-brand-deep sm:text-2xl">
              {renderPrice(property.price, property.on_calling)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-slate-600">
              <p>
                {property.location}, {property.city}
              </p>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <p>Area: {property.area}</p>
            </div>

            <PropertyAgentContactCard
              agentImageSrc={property.team_image}
              agentName={agentName}
              agentRole={agentRole}
              phone={PROPERTY_AGENT_FALLBACK.phone}
              email={PROPERTY_AGENT_FALLBACK.email}
              display="mobile"
              mobileClassName="pt-6"
            />
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-8 lg:px-8 lg:py-10 lg:pr-[calc(360px+40px+2rem)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950 lg:text-2xl">
                  Rooms and Spacing
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  A quick view of the property layout, room counts, and space details.
                </p>
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-deep">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-3.5 fill-none stroke-current stroke-[1.8]"
                >
                  <path d="M4 12h16M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {roomsAndSpacingFeatures.length ? (
              <>
                <DragScrollCarousel className="no-scrollbar -mx-6 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-2 lg:hidden">
                  {roomsAndSpacingFeatures.map((feature) => (
                    <div
                      key={`${feature.name}-${feature.value}`}
                      className="w-[44vw] min-w-[138px] max-w-[180px] shrink-0 snap-start"
                    >
                      <RoomsAndSpacingCard feature={feature} />
                    </div>
                  ))}
                </DragScrollCarousel>

                <div
                  className="mt-5 hidden gap-3 lg:grid"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, max-content))" }}
                >
                  {roomsAndSpacingFeatures.map((feature) => (
                    <RoomsAndSpacingCard
                      key={`${feature.name}-${feature.value}`}
                      feature={feature}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm text-slate-600">No room or spacing details listed.</p>
            )}
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-8 lg:px-8 lg:py-10 lg:pr-[calc(360px+40px+2rem)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950 lg:text-2xl">Amenities</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Available conveniences and lifestyle highlights for this property.
                </p>
              </div>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand-deep">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-3.5 fill-none stroke-current stroke-[1.8]"
                >
                  <path
                    d="M5 12.5 9.2 16.7 19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {property.facilities?.length ? (
              <PropertyAmenitiesGrid amenities={property.facilities} surface="default" />
            ) : (
              <p className="mt-5 text-sm text-slate-600">No amenities listed.</p>
            )}
          </div>
        </section>

        <PropertyLifeAroundArea areaName={propertyLocation || property.location || property.city} />

        <section className="w-full">
          <div className="mx-auto max-w-[1440px] px-6 py-10 sm:px-8 lg:px-8 lg:pt-12 lg:pb-[var(--property-content-bottom-space)] lg:pr-[calc(360px+40px+2rem)]">
            <article className="max-w-5xl">
              <h2 className="text-2xl font-semibold text-slate-950">About This Property</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Property in Nepal proudly presents this {propertyKind} for {propertyPurpose}
                {propertyLocation ? ` at ${propertyLocation}` : ""}. This listing offers a
                practical blend of location, comfort, and accessibility for buyers and tenants
                looking for a well-positioned property in Nepal.
              </p>
              {aboutFeatureList ? (
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  This {propertyKind} has {aboutFeatureList}. The total area is{" "}
                  {property.area || "N/A"}, giving the property a balanced layout for regular use,
                  family living, or long-term investment.
                </p>
              ) : null}
              {amenityList ? (
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  Modern amenities and facilities include {amenityList}.
                </p>
              ) : null}
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Asking budget:{" "}
                <span className="font-semibold text-slate-950">
                  {formatPropertyPrice(property.price, property.on_calling)}
                </span>
                . This property has {property.views} views, was listed on{" "}
                {property.created_at_human || "N/A"}, and is managed by{" "}
                {renderTeam(property.team)}.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                For more information, updated availability, negotiation details, or to schedule a
                property visit, contact {agentName} at {PROPERTY_AGENT_FALLBACK.phone} or{" "}
                {PROPERTY_AGENT_FALLBACK.email}.
              </p>
            </article>
          </div>
        </section>
      </div>

      {recommendedProperties.length ? (
        <section className="section-tone-white w-full">
          <div className="mx-auto max-w-[1440px] px-6 py-10 sm:px-8 lg:px-8 lg:py-12">
            <div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Recommended Properties
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Similar verified listings selected from current property inventory.
                </p>
              </div>
            </div>

            <DragScrollCarousel
              autoScrollIntervalMs={6500}
              className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-4 sm:-mx-8 sm:scroll-pl-8 sm:px-8"
            >
              {recommendedProperties.map((recommendedProperty, index) => (
                <div
                  key={`${recommendedProperty.id}-${index}`}
                  className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
                >
                  <RecommendedPropertyCard property={recommendedProperty} />
                </div>
              ))}
              <Link
                href="/properties"
                className="inline-flex w-[82vw] max-w-[360px] shrink-0 snap-start flex-col justify-between rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition-colors duration-300 hover:border-brand-deep hover:text-brand-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 sm:w-[46vw] lg:w-[31vw] xl:w-[320px]"
              >
                <span className="text-xl font-bold leading-tight">
                  View more properties
                </span>
                <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold">
                  Browse all listings
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-4 fill-none stroke-current stroke-2"
                  >
                    <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </DragScrollCarousel>
          </div>
        </section>
      ) : null}

    </>
  );
}
